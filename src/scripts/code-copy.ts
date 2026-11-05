// Wraps each code block with a "Copy" button above it.
const RESET_DELAY_MS = 2000;

function addCopyButtons() {
  document.querySelectorAll<HTMLPreElement>(".prose pre").forEach((pre) => {
    if (pre.parentElement?.classList.contains("code-block")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");

    const status = document.createElement("span");
    status.className = "visually-hidden";
    status.setAttribute("role", "status");

    pre.replaceWith(wrapper);
    wrapper.append(button, status, pre);

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        button.textContent = "Copied";
        status.textContent = "Code copied to clipboard";
      } catch {
        button.textContent = "Failed";
        status.textContent = "Could not copy code";
      }
      setTimeout(() => {
        button.textContent = "Copy";
        status.textContent = "";
      }, RESET_DELAY_MS);
    });
  });
}

// Runs on the first load and after every client-side navigation.
document.addEventListener("astro:page-load", addCopyButtons);
