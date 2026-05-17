import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, CreditCard, Bot, AlertCircle, HelpCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Legal: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: 'Términos y Condiciones', icon: <FileText className="w-5 h-5" /> },
    { id: 'privacy', label: 'Política de Privacidad', icon: <Shield className="w-5 h-5" /> },
    { id: 'refund', label: 'Política de Reembolsos', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'ai', label: 'Política de Uso de IA', icon: <Bot className="w-5 h-5" /> },
    { id: 'dmca', label: 'DMCA y Soporte', icon: <AlertCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate(user ? '/dashboard' : '/login');
              }
            }}
            disabled={loading}
            className={`p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-card)] rounded-full shadow-sm transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Políticas y Legal</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative">
          <div className="md:w-1/3">
            <div className="flex flex-col gap-2 sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--color-brand-cyan)] text-white shadow-md'
                      : 'bg-[var(--color-bg-card)] text-[var(--color-text-main)] hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="card-base p-6 md:p-8 rounded-2xl shadow-sm border border-[var(--color-border)] prose dark:prose-invert max-w-none text-[var(--color-text-main)]">
              
              {activeTab === 'terms' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[var(--color-brand-cyan)] mb-4">Términos y Condiciones</h2>
                  
                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">1. Aceptación de los términos</h3>
                    <p>Al acceder y utilizar esta plataforma, el usuario acepta cumplir los presentes términos y condiciones, así como las demás políticas publicadas dentro del sitio web. Si el usuario no está de acuerdo con alguna parte de estos términos, deberá abstenerse de utilizar la plataforma.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">2. Descripción del servicio</h3>
                    <p>La plataforma brinda servicios y herramientas de apoyo académico y orientación educativa, incluyendo:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Distribución de material de estudio y apoyo académico.</li>
                      <li>Resúmenes y contenido elaborado por colaboradores.</li>
                      <li>Prácticas y ejercicios académicos.</li>
                      <li>Recomendaciones automatizadas mediante inteligencia artificial.</li>
                      <li>Orientación educativa y vocacional.</li>
                      <li>Programas de descuentos socioeconómicos.</li>
                      <li>Y otras funcionalidades que puedan añadirse posteriormente.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">3. Naturaleza del material académico</h3>
                    <p>Parte del contenido disponible corresponde a material recopilado con fines educativos, resúmenes elaborados por colaboradores, prácticas académicas, ejercicios modificados o adaptados, y contenido de apoyo para estudiantes.</p>
                    <p>La plataforma no afirma tener representación oficial de universidades, academias, docentes o instituciones educativas, salvo indicación expresa. El material ofrecido tiene fines exclusivamente educativos y de apoyo académico.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">4. Uso permitido</h3>
                    <p>El usuario se compromete a utilizar la plataforma de manera responsable y conforme a la ley. Está prohibido:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Compartir cuentas sin autorización.</li>
                      <li>Revender contenido adquirido dentro de la plataforma.</li>
                      <li>Distribuir masivamente el material.</li>
                      <li>Alterar el funcionamiento del sitio.</li>
                      <li>Utilizar bots o herramientas automatizadas maliciosas.</li>
                      <li>Proporcionar información falsa en formularios o solicitudes.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">5. Compras y acceso a contenido</h3>
                    <p>Algunos productos y servicios podrán entregarse de forma digital mediante enlaces privados, visualización en línea, descarga electrónica o acceso temporal. La plataforma se reserva el derecho de modificar la forma de distribución del contenido cuando sea necesario por razones técnicas, organizativas o de seguridad.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">6. Sistema de descuentos socioeconómicos</h3>
                    <p>La plataforma podrá ofrecer descuentos especiales según la situación socioeconómica del estudiante. Para evaluar la solicitud, podrán requerirse documentos relacionados. El usuario declara que toda información proporcionada es verdadera y actualizada.</p>
                    <p>La plataforma podrá aprobar, rechazar, revisar, suspender o cancelar descuentos si detecta inconsistencias o información falsa.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">7. Protección y uso de información</h3>
                    <p>La información proporcionada por el usuario será utilizada únicamente para la gestión de cuentas, evaluación de descuentos, procesamiento de compras, mejora de la plataforma, funcionamiento de herramientas internas y soporte al usuario. La plataforma procurará mantener medidas razonables de seguridad y confidencialidad respecto de los datos recibidos.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">8. Herramientas de inteligencia artificial</h3>
                    <p>La plataforma puede incorporar herramientas de inteligencia artificial. Las respuestas generadas por IA son únicamente orientativas y no constituyen asesoría profesional, psicológica, universitaria o laboral definitiva.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">9. Limitación de responsabilidad</h3>
                    <p>La plataforma no garantiza ingresos, becas, admisiones, resultados académicos, ni resultados específicos derivados del uso del contenido o herramientas ofrecidas. El usuario utiliza la plataforma bajo su propia responsabilidad.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">10. Modificaciones y Contacto</h3>
                    <p>La plataforma podrá actualizar o modificar estos términos en cualquier momento. El usuario podrá comunicarse mediante los canales oficiales (<a href="mailto:novusprep@gmail.com" className="text-blue-500">novusprep@gmail.com</a>) para consultas, soporte o solicitudes relacionadas con el servicio.</p>
                  </section>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[var(--color-brand-cyan)] mb-4">Política de Privacidad</h2>
                  
                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">1. Información recopilada</h3>
                    <p>La plataforma podrá recopilar nombre o identificador del usuario, correo electrónico, información académica, datos necesarios para descuentos y documentos enviados voluntariamente por el usuario.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">2. Información socioeconómica</h3>
                    <p>Para acceder a descuentos especiales, podrán solicitarse documentos. El envío de esta información es completamente voluntario y recomendamos cubrir la información no necesaria (como números de cliente u otra información irrelevante) en los recibos u otros documentos. Evitamos almacenar demasiada información sensible para preservar su privacidad.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">3. Finalidad del uso de datos</h3>
                    <p>La información recopilada será utilizada para validar descuentos, gestionar compras, mejorar servicios, brindar soporte, personalizar recomendaciones y optimizar herramientas internas.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">4. Conservación de documentos</h3>
                    <p>Los documentos enviados para evaluación socioeconómica podrán eliminarse después de finalizar el proceso de revisión o luego del tiempo que la plataforma considere razonablemente necesario.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">5. Confidencialidad</h3>
                    <p>La plataforma no compartirá públicamente los documentos enviados por los usuarios y procurará proteger la información almacenada mediante medidas razonables de seguridad.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">6. Menores de edad</h3>
                    <p>Si el usuario es menor de edad, se recomienda contar con autorización de sus padres o tutores antes de enviar documentación o utilizar determinadas funciones de la plataforma.</p>
                  </section>
                </div>
              )}

              {activeTab === 'refund' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[var(--color-brand-emerald)] mb-4">Política de Reembolsos</h2>
                  
                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">1. Productos digitales</h3>
                    <p>Debido a la naturaleza digital del contenido de apoyo educativo ofrecido, las compras podrán considerarse no reembolsables una vez entregado el acceso, descarga o visualización del material.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">2. Excepciones</h3>
                    <p>Podrá evaluarse un reembolso en casos como errores técnicos graves, contenido incorrecto, imposibilidad comprobable de acceso, o cobros duplicados.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">3. Uso indebido</h3>
                    <p>No se otorgarán reembolsos si el contenido ya fue descargado o distribuido, el usuario incumplió los términos de uso, o el problema se originó por factores externos al funcionamiento de la plataforma.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">4. Revisión de solicitudes</h3>
                    <p>Toda solicitud de reembolso será evaluada individualmente por el equipo de soporte. Puedes contactarnos a <a href="mailto:novusprep@gmail.com" className="text-blue-500">novusprep@gmail.com</a>.</p>
                  </section>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-purple-500 mb-4">Política de Uso de IA</h2>
                  
                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">1. Función de la IA</h3>
                    <p>La plataforma podrá utilizar inteligencia artificial para recomendar contenido, responder preguntas, orientar académicamente, sugerir materiales, y apoyar procesos vocacionales.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">2. Limitaciones</h3>
                    <p>La IA puede cometer errores, generar respuestas inexactas o interpretar incorrectamente información proporcionada por el usuario. Por ello, las recomendaciones son únicamente orientativas, y no reemplazan asesoría profesional especializada.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">3. Uso responsable</h3>
                    <p>El usuario se compromete a no utilizar las herramientas de IA para actividades ilegales, fraude académico, manipulación maliciosa, envío de contenido ofensivo, o afectación de terceros.</p>
                  </section>
                </div>
              )}

              {activeTab === 'dmca' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[var(--color-brand-orange)] mb-4">Contacto, DMCA y Reportes</h2>
                  
                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Contacto y Soporte</h3>
                    <p>Para cualquier consulta, ayuda, reclamos o situaciones relacionadas con reembolsos, puedes contactar a nuestro equipo escribiendo a:</p>
                    <div className="flex items-center gap-3 p-4 mt-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl font-medium">
                      <Mail className="w-5 h-5" />
                      <a href="mailto:novusprep@gmail.com">novusprep@gmail.com</a>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Aviso de Derechos de Autor (DMCA) / Copyright</h3>
                    <p>Nuestra plataforma respeta la propiedad intelectual de terceros y promueve el uso legítimo de contenidos educativos. Todo el material ofrecido se proporciona bajo el marco de uso justo o ha sido creado por colaboradores, sin embargo, no admitimos infracciones de derechos de autor.</p>
                    <p>Si eres el propietario de derechos de autor (o su representante) y crees que algún contenido alojado en nuestra plataforma infringe tus derechos, envíanos una notificación a nuestro correo de contacto, detallando el material exacto en disputa, evidencia de titularidad y tus medios de contacto.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Sistema de reporte de contenido y Preguntas Frecuentes (FAQ)</h3>
                    <p>Si encuentras errores, contenido inapropiado o violaciones a nuestros Términos de Uso, te invitamos a reportarlo enviando un correo al equipo administrativo. Trabajamos de forma constante en mantener el entorno seguro y de calidad para todos los estudiantes.</p>
                    <div className="mt-4 p-4 border border-[var(--color-border)] rounded-xl bg-gray-50 dark:bg-gray-800/30">
                      <h4 className="font-bold mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4"/> Pregunta Frecuente: ¿Los materiales son oficiales?</h4>
                      <p className="text-sm">Todo es material recopilado de apoyo educativo, no afirmamos representación de ninguna universidad o entidad. Es contenido de referencia académica para estudiantes.</p>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
