const STORAGE_KEY = "nova_schedule_v3";

const dayNames = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб"
};

const fullDayNames = {
  1: "Понедельник",
  2: "Вторник",
  3: "Среда",
  4: "Четверг",
  5: "Пятница",
  6: "Суббота"
};

const colors = {
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-600 dark:text-violet-300",
    badge: "bg-violet-500"
  },

  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-600 dark:text-blue-300",
    badge: "bg-blue-500"
  },

  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-300",
    badge: "bg-emerald-500"
  },

  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-600 dark:text-orange-300",
    badge: "bg-orange-500"
  },

  pink: {
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    text: "text-pink-600 dark:text-pink-300",
    badge: "bg-pink-500"
  }
};


let events = JSON.parse(
  localStorage.getItem(STORAGE_KEY)
) || [
  {
    id: crypto.randomUUID(),
    title: "IT",
    icon: "💻",
    day: 1,
    start: "16:00",
    end: "17:30",
    place: "IT Center",
    color: "violet"
  },

  {
    id: crypto.randomUUID(),
    title: "English",
    icon: "🇬🇧",
    day: 2,
    start: "18:00",
    end: "19:00",
    place: "English Center",
    color: "blue"
  },

  {
    id: crypto.randomUUID(),
    title: "IT",
    icon: "💻",
    day: 3,
    start: "16:00",
    end: "17:30",
    place: "IT Center",
    color: "violet"
  },

  {
    id: crypto.randomUUID(),
    title: "English",
    icon: "🇬🇧",
    day: 4,
    start: "18:00",
    end: "19:00",
    place: "English Center",
    color: "blue"
  },

  {
    id: crypto.randomUUID(),
    title: "IT",
    icon: "💻",
    day: 5,
    start: "16:00",
    end: "17:30",
    place: "IT Center",
    color: "violet"
  },

  {
    id: crypto.randomUUID(),
    title: "English",
    icon: "🇬🇧",
    day: 6,
    start: "18:00",
    end: "19:00",
    place: "English Center",
    color: "blue"
  }
];


let selectedDay = new Date().getDay();

if (selectedDay === 0) {
  selectedDay = 1;
}

let draggedId = null;


function saveEvents() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(events)
  );
}


function minutesFromTime(time) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}


function formatCountdown(totalSeconds) {

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;


  if (days > 0) {
    return `${days}д ${String(hours).padStart(2, "0")}ч`;
  }


  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0")
  ].join(":");
}


function getTashkentTime() {

  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "Asia/Tashkent",
      weekday: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    }
  ).formatToParts(new Date());


  const get = type => {

    const value =
      parts.find(
        item => item.type === type
      )?.value;

    return Number(value);

  };


  return {
    day: get("weekday"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second")
  };
}


/* REAL TIME */

function updateRealTime() {

  const now = new Date();


  const timeFormatter =
    new Intl.DateTimeFormat(
      "ru-RU",
      {
        timeZone: "Asia/Tashkent",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }
    );


  const time =
    timeFormatter.format(now);


  const mainClock =
    document.getElementById("mainClock");

  const headerClock =
    document.getElementById("headerClock");


  if (mainClock) {
    mainClock.textContent = time;
  }


  if (headerClock) {
    headerClock.textContent = time;
  }


  const dateFormatter =
    new Intl.DateTimeFormat(
      "ru-RU",
      {
        timeZone: "Asia/Tashkent",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );


  const date =
    dateFormatter.format(now);


  const mainDate =
    document.getElementById("mainDate");


  if (mainDate) {
    mainDate.textContent = date;
  }


  updateNextLesson();

  updateLiveStatus();
}


/* TABS */

function renderTabs() {

  const tabs =
    document.getElementById("dayTabs");

  if (!tabs) return;


  tabs.innerHTML = "";


  Object.entries(dayNames)
    .forEach(([day, name]) => {

      const dayNumber =
        Number(day);


      const button =
        document.createElement("button");


      const active =
        dayNumber === selectedDay;


      button.className =
        `
        px-6 py-3
        rounded-2xl
        font-bold
        whitespace-nowrap
        transition
        ${
          active
            ? "animated-gradient text-white shadow-lg"
            : "glass hover:scale-105"
        }
        `;


      button.textContent = name;


      button.onclick = () => {

        selectedDay =
          dayNumber;

        renderAll();

      };


      tabs.appendChild(button);

    });
}


/* SCHEDULE */

function renderSchedule() {

  const grid =
    document.getElementById("scheduleGrid");

  if (!grid) return;


  grid.innerHTML = "";


  Object.entries(dayNames)
    .forEach(([day, name]) => {

      const dayNumber =
        Number(day);


      const column =
        document.createElement("div");


      column.className =
        `
        day-column
        glass
        rounded-[28px]
        p-4
        min-h-[350px]
        ${
          dayNumber === selectedDay
            ? "ring-2 ring-violet-500/30"
            : ""
        }
        `;


      column.dataset.day =
        dayNumber;


      column.innerHTML =
        `
        <div class="flex items-center justify-between mb-4">

          <div>
            <div class="text-lg font-black">
              ${name}
            </div>

            <div class="text-xs text-gray-400">
              ${fullDayNames[dayNumber]}
            </div>
          </div>

          <button
            onclick="openModal(null, ${dayNumber})"
            class="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 hover:scale-110 transition"
          >
            +
          </button>

        </div>
        `;


      const dayEvents =
        events
          .filter(
            event =>
              event.day === dayNumber
          )
          .sort(
            (a, b) =>
              minutesFromTime(a.start) -
              minutesFromTime(b.start)
          );


      if (!dayEvents.length) {

        const empty =
          document.createElement("div");


        empty.className =
          `
          h-56
          flex
          flex-col
          items-center
          justify-center
          text-gray-400
          `;


        empty.innerHTML =
          `
          <div class="text-4xl mb-3">
            ☁️
          </div>

          <div class="text-sm">
            Пока пусто
          </div>

          <button
            onclick="openModal(null, ${dayNumber})"
            class="mt-3 text-violet-500 font-bold text-sm"
          >
            + Добавить
          </button>
          `;


        column.appendChild(empty);

      } else {

        dayEvents.forEach(event => {

          column.appendChild(
            renderEvent(event)
          );

        });

      }


      column.addEventListener(
        "dragover",
        event => {

          event.preventDefault();

          column.classList.add(
            "drag-over"
          );

        }
      );


      column.addEventListener(
        "dragleave",
        () => {

          column.classList.remove(
            "drag-over"
          );

        }
      );


      column.addEventListener(
        "drop",
        event => {

          event.preventDefault();

          column.classList.remove(
            "drag-over"
          );


          const item =
            events.find(
              event =>
                event.id === draggedId
            );


          if (!item) return;


          item.day =
            dayNumber;


          saveEvents();

          renderAll();

        }
      );


      grid.appendChild(column);

    });
}


/* EVENT CARD */

function renderEvent(event) {

  const color =
    colors[event.color] ||
    colors.violet;


  const card =
    document.createElement("div");


  card.dataset.eventId =
    event.id;


  card.draggable = true;


  card.className =
    `
    event-card
    ${color.bg}
    border
    ${color.border}
    rounded-2xl
    p-4
    mb-3
    cursor-grab
    fade-up
    `;


  card.innerHTML =
    `
    <div class="flex items-start justify-between gap-2">

      <div class="flex items-center gap-3">

        <div
          class="
          w-11
          h-11
          rounded-xl
          ${color.badge}
          text-white
          flex
          items-center
          justify-center
          text-xl
          shadow-lg
          "
        >
          ${escapeHTML(event.icon)}
        </div>

        <div>

          <div class="font-black">
            ${escapeHTML(event.title)}
          </div>

          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${escapeHTML(event.place || "Без места")}
          </div>

        </div>

      </div>


      <button
        class="
        edit-event
        w-8
        h-8
        rounded-lg
        hover:bg-black/5
        dark:hover:bg-white/5
        "
      >
        ⋮
      </button>

    </div>


    <div class="flex items-center justify-between mt-4">

      <div class="
        font-black
        ${color.text}
      ">
        ${event.start} — ${event.end}
      </div>

      <div
        class="
        event-status
        text-xs
        font-bold
        "
      ></div>

    </div>
    `;


  card
    .querySelector(".edit-event")
    .onclick = e => {

      e.stopPropagation();

      openModal(event.id);

    };


  card.ondblclick = () => {

    openModal(event.id);

  };


  card.ondragstart = () => {

    draggedId =
      event.id;

  };


  card.ondragend = () => {

    draggedId = null;

  };


  return card;
}


/* NEXT LESSON */

function updateNextLesson() {

  const now =
    getTashkentTime();


  const currentMinutes =
    now.hour * 60 +
    now.minute +
    now.second / 60;


  let candidates = [];


  events.forEach(event => {

    let distance =
      (event.day - now.day + 7) % 7;


    const eventStart =
      minutesFromTime(
        event.start
      );


    if (
      distance === 0 &&
      eventStart <= currentMinutes
    ) {

      distance = 7;

    }


    const totalMinutes =
      distance * 1440 +
      eventStart -
      currentMinutes;


    candidates.push({
      event,
      totalMinutes
    });

  });


  if (!candidates.length) {

    return;

  }


  candidates.sort(
    (a, b) =>
      a.totalMinutes -
      b.totalMinutes
  );


  const next =
    candidates[0];


  const title =
    document.getElementById(
      "nextTitle"
    );

  const place =
    document.getElementById(
      "nextPlace"
    );

  const time =
    document.getElementById(
      "nextTime"
    );

  const icon =
    document.getElementById(
      "nextIcon"
    );

  const countdown =
    document.getElementById(
      "countdown"
    );


  if (title) {
    title.textContent =
      next.event.title;
  }


  if (place) {
    place.textContent =
      next.event.place ||
      "Место не указано";
  }


  if (time) {
    time.textContent =
      next.event.start;
  }


  if (icon) {
    icon.textContent =
      next.event.icon;
  }


  if (countdown) {

    const seconds =
      Math.max(
        0,
        Math.floor(
          next.totalMinutes * 60
        )
      );


    countdown.textContent =
      "Через " +
      formatCountdown(seconds);

  }
}


/* CURRENT LESSON */

function updateLiveStatus() {

  const now =
    getTashkentTime();


  const current =
    now.hour * 60 +
    now.minute +
    now.second / 60;


  document
    .querySelectorAll(
      "[data-event-id]"
    )
    .forEach(card => {

      const event =
        events.find(
          item =>
            item.id ===
            card.dataset.eventId
        );


      if (!event) return;


      const start =
        minutesFromTime(
          event.start
        );


      const end =
        minutesFromTime(
          event.end
        );


      const active =
        event.day === now.day &&
        current >= start &&
        current < end;


      const status =
        card.querySelector(
          ".event-status"
        );


      if (!status) return;


      if (active) {

        status.textContent =
          "● Сейчас";

        status.className =
          `
          event-status
          text-xs
          font-bold
          text-emerald-500
          pulse-dot
          `;

      } else {

        status.textContent =
          "";

      }

    });
}


/* STATS */

function updateStats() {

  const now =
    getTashkentTime();


  const today =
    events.filter(
      event =>
        event.day === now.day
    ).length;


  const week =
    events.length;


  const it =
    events.filter(
      event =>
        event.title
          .toLowerCase()
          .includes("it")
    ).length;


  const english =
    events.filter(
      event => {

        const title =
          event.title
            .toLowerCase();


        return (
          title.includes("english") ||
          title.includes("анг")
        );

      }
    ).length;


  const set =
    (id, value) => {

      const element =
        document.getElementById(id);

      if (element) {
        element.textContent =
          value;
      }

    };


  set("todayStat", today);

  set("weekStat", week);

  set("itStat", it);

  set(
    "englishStat",
    english
  );
}


/* MODAL */

function openModal(
  id = null,
  defaultDay = selectedDay
) {

  const modal =
    document.getElementById(
      "modal"
    );


  const form =
    document.getElementById(
      "eventForm"
    );


  if (!modal || !form) return;


  form.reset();


  document.getElementById(
    "eventId"
  ).value =
    id || "";


  document.getElementById(
    "eventDay"
  ).value =
    defaultDay;


  const deleteButton =
    document.getElementById(
      "deleteButton"
    );


  deleteButton.classList.toggle(
    "hidden",
    !id
  );


  if (id) {

    const event =
      events.find(
        item =>
          item.id === id
      );


    if (!event) return;


    document.getElementById(
      "modalTitle"
    ).textContent =
      "Редактировать занятие";


    document.getElementById(
      "eventTitle"
    ).value =
      event.title;


    document.getElementById(
      "eventIcon"
    ).value =
      event.icon;


    document.getElementById(
      "eventColor"
    ).value =
      event.color;


    document.getElementById(
      "eventDay"
    ).value =
      event.day;


    document.getElementById(
      "eventStart"
    ).value =
      event.start;


    document.getElementById(
      "eventEnd"
    ).value =
      event.end;


    document.getElementById(
      "eventPlace"
    ).value =
      event.place || "";

  } else {

    document.getElementById(
      "modalTitle"
    ).textContent =
      "Новое занятие";


    document.getElementById(
      "eventIcon"
    ).value =
      "📚";


    document.getElementById(
      "eventStart"
    ).value =
      "16:00";


    document.getElementById(
      "eventEnd"
    ).value =
      "17:00";

  }


  modal.classList.add(
    "active"
  );
}


function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );


  if (modal) {

    modal.classList.remove(
      "active"
    );

  }
}


/* SAVE EVENT */

document
  .getElementById("eventForm")
  ?.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const id =
        document.getElementById(
          "eventId"
        ).value;


      const title =
        document.getElementById(
          "eventTitle"
        ).value.trim();


      const icon =
        document.getElementById(
          "eventIcon"
        ).value.trim() ||
        "📚";


      const day =
        Number(
          document.getElementById(
            "eventDay"
          ).value
        );


      const start =
        document.getElementById(
          "eventStart"
        ).value;


      const end =
        document.getElementById(
          "eventEnd"
        ).value;


      const place =
        document.getElementById(
          "eventPlace"
        ).value.trim();


      const color =
        document.getElementById(
          "eventColor"
        ).value;


      if (!title) return;


      if (
        minutesFromTime(end) <=
        minutesFromTime(start)
      ) {

        alert(
          "Время окончания должно быть позже начала."
        );

        return;

      }


      const data = {
        title,
        icon,
        day,
        start,
        end,
        place,
        color
      };


      if (id) {

        const index =
          events.findIndex(
            event =>
              event.id === id
          );


        if (index !== -1) {

          events[index] = {
            ...events[index],
            ...data
          };

        }

      } else {

        events.push({
          id: crypto.randomUUID(),
          ...data
        });

      }


      saveEvents();

      closeModal();

      renderAll();

    }
  );


/* DELETE */

function deleteEvent() {

  const id =
    document.getElementById(
      "eventId"
    ).value;


  if (!id) return;


  events =
    events.filter(
      event =>
        event.id !== id
    );


  saveEvents();

  closeModal();

  renderAll();
}


/* QUICK ADD */

function quickAdd(type) {

  openModal(
    null,
    selectedDay
  );


  setTimeout(() => {

    if (type === "IT") {

      document.getElementById(
        "eventTitle"
      ).value =
        "IT";


      document.getElementById(
        "eventIcon"
      ).value =
        "💻";


      document.getElementById(
        "eventPlace"
      ).value =
        "IT Center";


      document.getElementById(
        "eventColor"
      ).value =
        "violet";


      document.getElementById(
        "eventStart"
      ).value =
        "16:00";


      document.getElementById(
        "eventEnd"
      ).value =
        "17:30";

    }


    if (type === "English") {

      document.getElementById(
        "eventTitle"
      ).value =
        "English";


      document.getElementById(
        "eventIcon"
      ).value =
        "🇬🇧";


      document.getElementById(
        "eventPlace"
      ).value =
        "English Center";


      document.getElementById(
        "eventColor"
      ).value =
        "blue";


      document.getElementById(
        "eventStart"
      ).value =
        "18:00";


      document.getElementById(
        "eventEnd"
      ).value =
        "19:00";

    }

  }, 20);
}


/* SEARCH */

document
  .getElementById("searchInput")
  ?.addEventListener(
    "input",
    event => {

      const query =
        event.target.value
          .toLowerCase()
          .trim();


      document
        .querySelectorAll(
          "[data-event-id]"
        )
        .forEach(card => {

          const item =
            events.find(
              event =>
                event.id ===
                card.dataset.eventId
            );


          if (!item) return;


          const text =
            `
            ${item.title}
            ${item.place}
            ${item.start}
            ${item.end}
            `.toLowerCase();


          card.style.display =
            text.includes(query)
              ? ""
              : "none";

        });

    }
  );


/* DARK MODE */

const savedTheme =
  localStorage.getItem(
    "nova_theme"
  );


if (savedTheme === "dark") {

  document.documentElement
    .classList
    .add("dark");

}


function updateThemeButton() {

  const button =
    document.getElementById(
      "themeButton"
    );


  if (!button) return;


  const dark =
    document.documentElement
      .classList
      .contains("dark");


  button.textContent =
    dark ? "☀️" : "🌙";
}


updateThemeButton();


document
  .getElementById("themeButton")
  ?.addEventListener(
    "click",
    () => {

      document.documentElement
        .classList
        .toggle("dark");


      const dark =
        document.documentElement
          .classList
          .contains("dark");


      localStorage.setItem(
        "nova_theme",
        dark
          ? "dark"
          : "light"
      );


      updateThemeButton();

    }
  );


/* MODAL */

document
  .getElementById("modal")
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target.id ===
        "modal"
      ) {

        closeModal();

      }

    }
  );


document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closeModal();

    }

  }
);


/* SCROLL */

function scrollToSchedule() {

  document
    .getElementById(
      "scheduleSection"
    )
    ?.scrollIntoView({
      behavior: "smooth"
    });

}


/* RENDER */

function renderAll() {

  renderTabs();

  renderSchedule();

  updateStats();

  updateNextLesson();

  updateLiveStatus();

}


/* START */

renderAll();

updateRealTime();

setInterval(
  updateRealTime,
  1000
);