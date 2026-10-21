import { useState } from "react";
import "./AccordionGallery.css";

export default function AccordionGallery({
  items = [],
  defaultIndex = 0,
  className = "",
}) {
  const [active, setActive] = useState(
    Math.min(Math.max(defaultIndex, 0), Math.max(items.length - 1, 0)),
  );

  function handleKeyDown(event, index) {
    if (items.length === 0) return;

    let next = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % items.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + items.length) % items.length;
    } else {
      return;
    }

    event.preventDefault();
    setActive(next);

    event.currentTarget.parentElement?.parentElement
      ?.querySelectorAll(".ag-panel__toggle")
      [next]?.focus();
  }

  return (
    <div className={`accordion-gallery ${className}`}>
      {items.map((item, index) => {
        const isActive = index === active;
        const isProfessional = item.id === "professional";

        return (
          <article
            key={item.id ?? item.title ?? index}
            className={`ag-panel ${
              isActive ? "ag-panel--active" : ""
            } ${isProfessional ? "ag-panel--professional" : ""}`}
            onMouseEnter={() => setActive(index)}
            onFocusCapture={() => setActive(index)}
          >
            <button
              type="button"
              className="ag-panel__toggle"
              onClick={() => setActive(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              aria-expanded={isActive}
            >
              <span className="ag-panel__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="ag-panel__heading">{item.title}</span>
              <span className="ag-panel__summary">{item.summary}</span>
              <span className="ag-panel__indicator">
                {isActive ? "−" : "+"}
              </span>
            </button>

            <div className="ag-panel__content" aria-hidden={!isActive}>
              {isActive && item.content}
            </div>
          </article>
        );
      })}
    </div>
  );
}
