// Funciones para mostrar notificaciones y modales
import * as bootstrap from "bootstrap"

// Mostrar notificación
export function showNotification(message, type = "success") {
  const toastContainer = document.querySelector(".toast-container")

  if (!toastContainer) {
    const container = document.createElement("div")
    container.className = "toast-container"
    document.body.appendChild(container)
  }

  const toast = document.createElement("div")
  toast.className = `toast bg-${type} text-white`
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "assertive")
  toast.setAttribute("aria-atomic", "true")

  toast.innerHTML = `
    <div class="toast-header bg-${type} text-white">
      <strong class="me-auto">GranitoSkate Admin</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `

  document.querySelector(".toast-container").appendChild(toast)

  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000,
  })

  bsToast.show()

  // Eliminar el toast después de ocultarse
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove()
  })
}

// Mostrar modal de confirmación
export function showConfirmModal(message, callback) {
  const confirmModal = document.getElementById("confirmModal")
  const confirmMessage = document.getElementById("confirm-message")
  const confirmActionBtn = document.getElementById("confirm-action-btn")

  // Actualizar mensaje
  confirmMessage.textContent = message

  // Actualizar acción del botón
  const oldConfirmAction = confirmActionBtn.onclick
  confirmActionBtn.onclick = () => {
    callback()
    const modal = bootstrap.Modal.getInstance(confirmModal)
    modal.hide()

    // Restaurar acción anterior
    setTimeout(() => {
      confirmActionBtn.onclick = oldConfirmAction
    }, 100)
  }

  // Mostrar modal
  const modal = new bootstrap.Modal(confirmModal)
  modal.show()
}
