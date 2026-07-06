const form = document.getElementById("chatForm");
const promptInput = document.getElementById("prompt");
const messagesBox = document.getElementById("messages");
const clearBtn = document.getElementById("clearBtn");
const modeSelect = document.getElementById("mode");
const modelSelect = document.getElementById("modelSelect"); // Capturamos el nuevo selector

let messages = JSON.parse(localStorage.getItem("minigpt_messages")) || [];

function saveMessages() {
  localStorage.setItem("minigpt_messages", JSON.stringify(messages));
}

function renderMessages() {
  messagesBox.innerHTML = "";
  if (messages.length === 0) {
    addBubble("assistant", "Hola 👋 Soy MiniGPT HF. Pregúntame lo que necesites.", false);
    return;
  }
  messages.forEach(msg => addBubble(msg.role, msg.content, false));
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function addBubble(role, content, shouldScroll = true) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = content;
  messagesBox.appendChild(div);
  if (shouldScroll) messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function sendMessage(userText) {
  messages.push({ role: "user", content: userText });
  saveMessages();
  renderMessages();

  const loading = { role: "assistant", content: "Pensando..." };
  messages.push(loading);
  renderMessages();

  // Captura el modo y el modelo seleccionado con su respectivo proveedor
  const currentMode = modeSelect?.value || "js";
  const selectedOption = modelSelect?.options[modelSelect.selectedIndex];
  const currentModel = selectedOption?.value || "meta-llama/Llama-3.1-8B-Instruct";
  const currentProvider = selectedOption?.getAttribute("data-provider") || "auto";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: currentMode,
        model: currentModel,       // Enviamos el modelo elegido
        provider: currentProvider, // Enviamos el proveedor asignado ("auto")
        messages: messages.filter(m => m.content !== "Pensando...")
      })
    });

    const data = await response.json();
    messages.pop();

    if (!response.ok) {
      messages.push({
        role: "assistant error",
        content: data.error || "Error desconocido."
      });
    } else {
      messages.push({ role: "assistant", content: data.answer });
    }
  } catch (error) {
    messages.pop();
    messages.push({
      role: "assistant error",
      content: "No se pudo conectar con el backend: " + error.message
    });
  }

  saveMessages();
  renderMessages();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;

  promptInput.value = "";
  form.querySelector("button").disabled = true;
  await sendMessage(text);
  form.querySelector("button").disabled = false;
  promptInput.focus();
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

clearBtn.addEventListener("click", () => {
  messages = [];
  saveMessages();
  renderMessages();
});

renderMessages();