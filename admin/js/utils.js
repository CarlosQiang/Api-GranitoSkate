// Funciones de utilidad para el panel de administración

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return "-"

  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Truncar texto
function truncateText(text, maxLength) {
  if (!text) return "-"

  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}

// Formatear valoración (estrellas)
function formatRating(rating) {
  if (!rating) return "-"

  let stars = ""
  for (let i = 0; i < rating; i++) {
    stars += "★"
  }
  for (let i = rating; i < 5; i++) {
    stars += "☆"
  }

  return stars
}

// Mostrar notificación
function showNotification(message, type = "success") {
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
function showConfirmModal(message, callback) {
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
