// Mac trackpads often report (hover: none), so CSS :hover only sticks after click.
// mouseenter/mouseleave still fire when the cursor moves over elements.
function bindPointerHover(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener("mouseenter", () => el.classList.add("is-pointer-hover"));
    el.addEventListener("mouseleave", () => el.classList.remove("is-pointer-hover"));
  });
}

bindPointerHover(".module-card");
bindPointerHover(".things-hub__tile");
