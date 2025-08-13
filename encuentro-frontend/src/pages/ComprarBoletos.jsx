import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { eventosAPI } from "../api/eventosAPI";
import { ticketsAPI, asientosAPI } from "../api/ticketsAPI";
import { WEBSOCKET_CONFIG } from "../api/config";
import { useAuth } from "../contexts/AuthContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

const IVA_RATE = 0.12; // 12%

// Componente para manejar timers de asientos
const TimerComponent = ({ numero, holdUntil, startTimer, stopTimer }) => {
  useEffect(() => {
    startTimer(numero, holdUntil);
    return () => stopTimer(numero);
  }, [numero, holdUntil, startTimer, stopTimer]);

  return (
    <span id={`timer-${numero}`} className="ml-1 text-[10px] opacity-90" />
  );
};

const ComprarBoletos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, userId, userName } = useAuth();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Estado del usuario completo
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Estado de compra exitosa
  const [purchaseInfo, setPurchaseInfo] = useState(null); // { cantidad, evento }

  // Estado de asientos
  const [seats, setSeats] = useState(new Map()); // numero -> { numero, estado, holdUntil, asientoId }
  const [selected, setSelected] = useState(new Set()); // asientos que YO puse en HOLD
  const [wsConnected, setWsConnected] = useState(false); // Estado de conexión WebSocket
  const [loadingSeats, setLoadingSeats] = useState(new Set()); // Asientos que están siendo procesados

  // Refs para timers y WS
  const timersRef = useRef(new Map()); // numero -> intervalId
  const wsClientRef = useRef(null);
  const wsSubRef = useRef(null);
  const syncIntervalIdRef = useRef(null);
  const nextExpiryTimeoutIdRef = useRef(null);
  const syncInFlightRef = useRef(false);

  // ---- helpers UI
  const colorClass = (estado) =>
    estado === "AVAILABLE"
      ? "bg-green-600"
      : estado === "HOLD"
      ? "bg-yellow-600"
      : "bg-red-600";

  const precioUnitario = useMemo(
    () => Number.parseFloat(evento?.precio ?? 0) || 0,
    [evento]
  );
  const totales = useMemo(() => {
    const qty = selected.size;
    const subtotal = +(qty * precioUnitario).toFixed(2);
    const iva = +(subtotal * IVA_RATE).toFixed(2);
    const total = +(subtotal + iva).toFixed(2);
    return { precioUnitario, subtotal, iva, total, qty };
  }, [selected, precioUnitario]);

  // ---- navegación si no está logueado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/comprar-boletos/${id}` } });
    }
  }, [isAuthenticated, navigate, id]);

  // ---- cargar datos completos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !userId || userData || loadingUserData) return;

      setLoadingUserData(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/ms-usuarios/api/usuarios/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          console.log("Datos del usuario cargados:", data);
        } else {
          console.warn(
            "No se pudieron cargar los datos del usuario:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, userId]);

  // ---- cargar evento y asientos + conectar WS
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    let mounted = true;
    const init = async () => {
      setLoading(true);
      try {
        // Evento por id (del param)
        const resp = await eventosAPI.getById(id);
        const eventoData = resp.respuesta || resp.data || resp;
        if (mounted) setEvento(eventoData);

        // Conectar WS primero
        connectWS();
        // Luego cargar asientos (con auto-inicialización si es necesario)
        setTimeout(() => {
          loadSeats().catch((error) => {
            console.error("Error inicial cargando asientos:", error);
          });
        }, 300);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Error al cargar los detalles del evento");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    return () => {
      mounted = false;
      disconnectWS();
      stopAllTimers();
      clearSyncs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  // Función de inicialización manual (ya no se usa automáticamente)
  const initializeSeatsManually = async () => {
    try {
      console.log("Inicializando asientos manualmente para evento:", id);
      const response = await fetch(`http://localhost:8081/api/holds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEvento: Number(id), asientos: [1] }),
      });

      if (!response.ok) {
        console.warn("No se pudo inicializar asientos");
        setError(
          "No se pudieron inicializar los asientos. Verifica la conexión."
        );
        return;
      }

      console.log("Asientos inicializados exitosamente");
      setError(null);

      // Cargar asientos después de inicializar
      await loadSeats();
    } catch (e) {
      console.error("Error al inicializar asientos:", e);
      setError("Error al inicializar asientos: " + e.message);
    }
  };

  // -------- REST
  const loadSeats = async () => {
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    try {
      stopAllTimers();
      // Usar la API directa como en el tester
      const response = await fetch(
        `http://localhost:8081/api/eventos/${id}/asientos`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const map = new Map();
      if (Array.isArray(data)) {
        data.forEach((s) =>
          map.set(s.numero, {
            numero: s.numero,
            estado: s.estado,
            holdUntil: s.holdUntil,
            asientoId: s.asientoId,
          })
        );
      }
      setSeats(map);

      // limpiar seleccionados que ya no estén en HOLD
      setSelected((prev) => {
        const copy = new Set(prev);
        for (const n of Array.from(copy)) {
          const seat = map.get(n);
          if (!seat || seat.estado !== "HOLD") copy.delete(n);
        }
        return copy;
      });

      scheduleNextExpirySync(map);
      if (data.length === 0) {
        console.warn("No hay asientos para este evento.");
        setError(
          "No hay asientos configurados para este evento. Contacta al administrador."
        );
        // No inicializar automáticamente para evitar selección automática
      }
    } finally {
      syncInFlightRef.current = false;
    }
  };

  const holdSeat = async (numero) => {
    // Verificar que el asiento está disponible
    const seat = seats.get(numero);
    if (!seat || seat.estado !== "AVAILABLE") {
      console.warn(`Asiento ${numero} no está disponible para seleccionar`);
      return;
    }

    // Verificar si ya está siendo procesado
    if (loadingSeats.has(numero)) {
      console.warn(`Asiento ${numero} ya está siendo procesado`);
      return;
    }

    try {
      setError(null); // Limpiar errores previos
      setLoadingSeats((prev) => new Set(prev).add(numero)); // Marcar como procesando
      console.log(`Intentando hacer HOLD del asiento ${numero}`);

      // Usar la API directa como en el tester
      const response = await fetch(`http://localhost:8081/api/holds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEvento: Number(id), asientos: [numero] }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${response.status} ${response.statusText} :: ${errorText}`
        );
      }

      // Agregar a seleccionados inmediatamente
      setSelected((prev) => {
        const newSelected = new Set(prev);
        newSelected.add(numero);
        return newSelected;
      });

      console.log(`HOLD asiento ${numero} solicitado exitosamente`);

      // Cargar asientos para obtener el holdUntil real del backend
      await loadSeats();
    } catch (e) {
      console.error("Error al hacer HOLD del asiento:", e);
      setError(e?.message || `No se pudo reservar el asiento ${numero}`);

      // Remover de seleccionados si falló
      setSelected((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(numero);
        return newSelected;
      });
    } finally {
      // Remover del estado de procesando
      setLoadingSeats((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete(numero);
        return newLoading;
      });
    }
  };

  const purchase = async () => {
    // Verificar que tenemos los datos del usuario
    if (!userData) {
      setError(
        "Error: No se han cargado los datos del usuario. Intenta recargar la página."
      );
      return;
    }

    // Obtener datos del usuario desde el endpoint
    const { cedula, nombre, apellido } = userData;

    // Validaciones
    if (!cedula || !nombre) {
      setError("Error: Datos del usuario incompletos");
      return;
    }

    if (!/^\d{10}$/.test(cedula)) {
      setError(
        "Error: La cédula del usuario debe tener exactamente 10 dígitos"
      );
      return;
    }

    const asientos = Array.from(selected);
    if (asientos.length === 0) {
      setError("Selecciona al menos un asiento (HOLD) para comprar");
      return;
    }

    console.log("Datos del usuario para compra:", {
      nombre,
      apellido: apellido || "",
      cedula,
      userData,
    });

    try {
      setLoadingCompra(true);
      setError(null);

      const response = await fetch(`http://localhost:8081/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEvento: Number(id),
          asientos,
          nombre,
          apellido: apellido || "",
          cedula,
          precioUnitario: precioUnitario,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${response.status} ${response.statusText} :: ${errorText}`
        );
      }

      const resp = await response.json();

      console.log("Factura:", resp);

      // Guardar información de la compra antes de limpiar selected
      setPurchaseInfo({
        cantidad: asientos.length,
        evento: evento?.nombre || "Evento",
      });

      setSuccess(true);
      setTimeout(() => navigate("/mis-compras"), 2500);
    } catch (e) {
      console.error(e);
      setError(
        "Error al procesar la compra: " +
          (e?.response?.data?.mensaje || e?.message || "Error desconocido")
      );
    } finally {
      setLoadingCompra(false);
    }
  };

  // -------- WS
  const connectWS = () => {
    try {
      // Usar la URL directa del microservicio como en el tester
      const wsUrl = "http://localhost:8081/ws";

      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("WebSocket conectado exitosamente");
          setWsConnected(true);
          // Suscripción por evento
          wsSubRef.current?.unsubscribe?.();
          wsSubRef.current = client.subscribe(
            `/topic/eventos/${id}/asientos`,
            (frame) => {
              try {
                const payload = JSON.parse(frame.body);
                console.log("WebSocket mensaje recibido:", payload);
                // payload: { idEvento, asiento(numero), estado, holdUntil }
                const { asiento: numero, estado, holdUntil } = payload;

                setSeats((prev) => {
                  const map = new Map(prev);
                  const s = map.get(numero) || { numero };
                  map.set(numero, {
                    ...s,
                    estado,
                    holdUntil,
                    asientoId: s.asientoId,
                  });
                  return map;
                });

                // Si un asiento cambió a !HOLD, quítalo de mi selección
                if (estado !== "HOLD") {
                  setSelected((prev) => {
                    const copy = new Set(prev);
                    copy.delete(numero);
                    return copy;
                  });
                }

                // reprograma sync por expiración
                scheduleNextExpirySync();
              } catch (e) {
                console.error("Error parseando mensaje WebSocket:", e);
              }
            }
          );
          // polling de respaldo
          schedulePeriodicSync();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame?.headers?.message || frame);
          // En caso de error, usar solo polling
          schedulePeriodicSync();
        },
        onWebSocketError: (event) => {
          console.error("WebSocket error:", event);
          // Fallback a polling más frecuente si WebSocket falla
          schedulePeriodicSync();
        },
        onDisconnect: () => {
          console.log("WebSocket desconectado");
          setWsConnected(false);
          // Reiniciar polling cuando se desconecta
          schedulePeriodicSync();
        },
      });
      wsClientRef.current = client;
      client.activate();
    } catch (e) {
      console.error("WS connect error:", e);
      // Si no se puede conectar WebSocket, usar solo polling
      schedulePeriodicSync();
    }
  };

  const disconnectWS = () => {
    try {
      wsSubRef.current?.unsubscribe?.();
      wsClientRef.current?.deactivate?.();
    } catch {}
    wsSubRef.current = null;
    wsClientRef.current = null;
    setWsConnected(false);
  };

  // -------- Timers (countdown) y auto-sync

  const stopTimer = (numero) => {
    const id = timersRef.current.get(numero);
    if (id) {
      clearInterval(id);
      timersRef.current.delete(numero);
    }
  };
  const stopAllTimers = () => {
    for (const id of timersRef.current.values()) clearInterval(id);
    timersRef.current.clear();
  };

  const startTimer = (numero, iso) => {
    if (!numero || !iso) {
      console.warn("startTimer: numero o iso faltante", { numero, iso });
      return;
    }

    stopTimer(numero);
    const target = Date.parse(iso);
    if (Number.isNaN(target)) {
      console.warn("startTimer: fecha inválida", iso);
      return;
    }

    const tick = () => {
      const span = document.getElementById(`timer-${numero}`);
      if (!span) {
        console.warn(`Timer span no encontrado para asiento ${numero}`);
        stopTimer(numero);
        return;
      }

      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const mm = String(Math.floor(diff / 60)).padStart(2, "0");
      const ss = String(diff % 60).padStart(2, "0");
      span.textContent = `${mm}:${ss}`;

      if (diff <= 0) {
        stopTimer(numero);
        syncSoon(1500);
      }
    };

    // Ejecutar inmediatamente y luego cada segundo
    tick();
    const idInt = setInterval(tick, 1000);
    timersRef.current.set(numero, idInt);
  };

  const clearSyncs = () => {
    if (syncIntervalIdRef.current) {
      clearInterval(syncIntervalIdRef.current);
      syncIntervalIdRef.current = null;
    }
    if (nextExpiryTimeoutIdRef.current) {
      clearTimeout(nextExpiryTimeoutIdRef.current);
      nextExpiryTimeoutIdRef.current = null;
    }
  };

  const schedulePeriodicSync = () => {
    clearSyncs();
    // Usar un intervalo más corto si WebSocket no está funcionando
    const interval = wsClientRef.current?.connected ? 30000 : 10000;
    syncIntervalIdRef.current = setInterval(() => {
      loadSeats().catch((error) => {
        console.error("Error en sync periódico:", error);
      });
    }, interval);
  };

  const scheduleNextExpirySync = (mapParam) => {
    const map = mapParam || seats;
    if (nextExpiryTimeoutIdRef.current) {
      clearTimeout(nextExpiryTimeoutIdRef.current);
      nextExpiryTimeoutIdRef.current = null;
    }
    const now = Date.now();
    const holds = Array.from(map.values())
      .filter(
        (s) =>
          s.estado === "HOLD" &&
          s.holdUntil &&
          !Number.isNaN(Date.parse(s.holdUntil))
      )
      .map((s) => Date.parse(s.holdUntil))
      .filter((t) => t > now);
    if (holds.length === 0) return;
    const next = Math.min(...holds);
    const delay = Math.max(0, next - now + 1500);
    nextExpiryTimeoutIdRef.current = setTimeout(() => {
      loadSeats().catch(() => {});
    }, delay);
  };

  const syncSoon = (delayMs = 1200) => {
    if (nextExpiryTimeoutIdRef.current)
      clearTimeout(nextExpiryTimeoutIdRef.current);
    nextExpiryTimeoutIdRef.current = setTimeout(() => {
      loadSeats().catch(() => {});
    }, delayMs);
  };

  // -------- Render
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/80">Cargando información del evento...</p>
        </div>
      </div>
    );
  }

  if (error && !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-white/80 mb-4">{error}</p>
          <Link
            to={`/evento/${id}`}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
          >
            Volver al Evento
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            ¡Compra Exitosa!
          </h2>
          <p className="text-white/80 mb-2">
            Se han comprado {purchaseInfo?.cantidad || 0} boleto(s) para:
          </p>
          <p className="text-cyan-400 font-semibold text-xl mb-4">
            {purchaseInfo?.evento || evento?.nombre}
          </p>
          <p className="text-white/60 mb-6">Redirigiendo a tus compras...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/evento/${id}`}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al evento
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Comprar Boletos
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Información del evento */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Información del Evento
            </h2>
            {evento && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400">
                  {evento.nombre}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-white/80">
                  <div>
                    <span className="block text-white/60 text-sm">Fecha</span>
                    <span className="font-medium">
                      {new Date(evento.fecha).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-white/60 text-sm">Hora</span>
                    <span className="font-medium">{evento.hora}</span>
                  </div>
                  <div>
                    <span className="block text-white/60 text-sm">Lugar</span>
                    <span className="font-medium">
                      {evento.establecimiento}
                    </span>
                  </div>
                  <div>
                    <span className="block text-white/60 text-sm">
                      Precio por boleto
                    </span>
                    <span className="font-medium text-green-400">
                      ${precioUnitario.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-white mb-4">
              Selecciona tus asientos
            </h2>
              {/* Leyenda */}
              <div className="flex items-center gap-3 text-white/80 mb-4">
                <span className="w-4 h-4 rounded bg-green-600 border border-white/20" />{" "}
                Libre
                <span className="w-4 h-4 rounded bg-yellow-600 border border-white/20" />{" "}
                Reservado
                <span className="w-4 h-4 rounded bg-red-600 border border-white/20" />{" "}
                Comprado
              </div>

              {/* Grilla */}
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 mb-6">
                {Array.from(seats.values())
                  .sort((a, b) => a.numero - b.numero)
                  .map((s) => (
                    <div
                      key={s.numero}
                      className={`h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold border border-white/20 cursor-pointer ${colorClass(
                        s.estado
                      )} ${
                        selected.has(s.numero) ? "ring-2 ring-cyan-400" : ""
                      }`}
                      title={`Asiento ${s.numero} - ${s.estado}`}
                      onClick={() => {
                        if (s.estado === "AVAILABLE") {
                          holdSeat(s.numero);
                        }
                      }}
                      style={{
                        cursor:
                          s.estado === "AVAILABLE" ? "pointer" : "not-allowed",
                        opacity: s.estado === "AVAILABLE" ? 1 : 0.7,
                      }}
                    >
                      <span>{s.numero}</span>
                      {s.estado === "HOLD" && (
                        <TimerComponent
                          numero={s.numero}
                          holdUntil={s.holdUntil}
                          startTimer={startTimer}
                          stopTimer={stopTimer}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sección de asientos + resumen */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            {/* Resumen */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Resumen</h3>
              <div className="space-y-2 text-white/80">
                <div className="flex justify-between">
                  <span>Asientos seleccionados:</span>
                  <span className="font-medium">
                    {Array.from(selected)
                      .sort((a, b) => a - b)
                      .join(", ") || "ninguno"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cantidad:</span>
                  <span className="font-medium">{totales.qty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio unitario:</span>
                  <span className="font-medium">
                    ${totales.precioUnitario.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    ${totales.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (12%):</span>
                  <span className="font-medium">${totales.iva.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold text-green-400">
                    <span>Total:</span>
                    <span>${totales.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón comprar */}
            <button
              onClick={purchase}
              disabled={
                loadingCompra || !evento || loadingUserData || !userData
              }
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                loadingCompra || loadingUserData || !userData
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/25"
              } text-white`}
            >
              {loadingCompra ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Procesando compra...
                </div>
              ) : loadingUserData ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Cargando datos del usuario...
                </div>
              ) : !userData ? (
                "Datos del usuario no disponibles"
              ) : (
                `🎫 Comprar ${totales.qty} Boleto${
                  totales.qty !== 1 ? "s" : ""
                } - $${totales.total.toFixed(2)}`
              )}
            </button>

            {/* Errores */}
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
                {error.includes("No hay asientos configurados") && (
                  <button
                    onClick={initializeSeatsManually}
                    className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Inicializar Asientos
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprarBoletos;
