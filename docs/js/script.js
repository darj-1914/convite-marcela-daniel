(function () {
  const config = window.wedding;

  if (!config) {
    return;
  }

  const root = document.documentElement;
  const opening = document.getElementById("opening");
  const openInvitationButton = document.getElementById("openInvitation");
  const backgroundAudio = document.getElementById("backgroundAudio");
  let isOpening = false;
  let isStartingAudio = false;
  document.body.classList.remove("is-ready");
  const toAbsoluteAssetUrl = (src) => new URL(src, window.location.href).href;
  const groom = config.couple.groom || "";
  const bride = config.couple.bride || "";
  const displayNames = config.couple.displayNames || [bride, "&", groom].filter(Boolean).join("\n");
  const coupleNamesElement = document.getElementById("coupleNames");
  const countdownValue = document.getElementById("countdownValue");
  const countdownDays = document.getElementById("countdownDays");
  const countdownHours = document.getElementById("countdownHours");
  const countdownMinutes = document.getElementById("countdownMinutes");
  const countdownSeconds = document.getElementById("countdownSeconds");

  const textMap = [
    ["openingHint", config.copy.openingHint],
    ["supportingText", config.copy.supportingText],
    ["dateValue", config.event.dateDisplay],
    ["timeValue", config.event.time],
    ["venueValue", config.event.venue],
    ["locationValue", config.event.region]
  ];

  textMap.forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element && typeof value === "string") {
      element.textContent = value;
    }
  });

  const escapeHtml = (value) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  if (coupleNamesElement) {
    const nameLines = displayNames
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    coupleNamesElement.innerHTML = nameLines
      .map((line) => {
        const ampersandClass = line === "&" ? " invitation-card__name-line--ampersand" : "";
        return `<span class="invitation-card__name-line${ampersandClass}">${escapeHtml(line)}</span>`;
      })
      .join("");
  }

  const pad = (value, size = 2) => String(value).padStart(size, "0");

  const updateAppHeight = () => {
    root.style.setProperty("--app-height", `${window.innerHeight}px`);
  };

  updateAppHeight();
  window.addEventListener("resize", updateAppHeight);
  window.addEventListener("orientationchange", updateAppHeight);

  const updateCountdown = () => {
    if (!countdownValue || !config.event.dateIso) {
      return;
    }

    const now = new Date();
    const eventDate = new Date(config.event.dateIso);
    const diffMs = eventDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      countdownValue.setAttribute("aria-label", "O grande dia chegou");
      countdownDays.textContent = "000";
      countdownHours.textContent = "00";
      countdownMinutes.textContent = "00";
      countdownSeconds.textContent = "00";
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownDays.textContent = pad(days, 3);
    countdownHours.textContent = pad(hours);
    countdownMinutes.textContent = pad(minutes);
    countdownSeconds.textContent = pad(seconds);
    countdownValue.setAttribute(
      "aria-label",
      `Faltam ${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`
    );
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const linkMap = [
    ["giftsLink", config.links.gifts, config.copy.giftsLabel],
    ["mapsLink", config.links.maps, config.copy.mapsLabel],
    ["officialSiteLink", config.links.official, config.copy.officialLabel],
    ["rsvpLink", config.links.rsvp, config.copy.rsvpLabel]
  ];

  linkMap.forEach(([id, href, label]) => {
    const link = document.getElementById(id);
    if (!link) {
      return;
    }

    link.href = href;
    link.textContent = label;
  });

  const locationLink = document.getElementById("locationLink");
  if (locationLink && config.links.maps) {
    locationLink.href = config.links.maps;
  }

  const imageMap = [
    ["coverMonogramImage", config.visuals.monogramImage],
    ["coverMonogramPreview", config.visuals.monogramImage],
    ["heroImage", config.visuals.pierImage],
    ["coupleImage", config.visuals.coupleImage]
  ];

  imageMap.forEach(([id, src]) => {
    const image = document.getElementById(id);
    if (!image || !src) {
      return;
    }

    const resolvedSrc = toAbsoluteAssetUrl(src);

    if (image.tagName === "IMG") {
      image.src = resolvedSrc;
      return;
    }

    image.style.setProperty("--monogram-image", `url("${resolvedSrc}")`);
  });

  if (config.visuals.monogramImage) {
    root.style.setProperty("--monogram-image", `url("${toAbsoluteAssetUrl(config.visuals.monogramImage)}")`);
  }

  if (backgroundAudio && config.audio?.backgroundMusic) {
    backgroundAudio.src = toAbsoluteAssetUrl(config.audio.backgroundMusic);
    backgroundAudio.loop = config.audio.loop !== false;

    if (typeof config.audio.volume === "number") {
      backgroundAudio.volume = Math.min(1, Math.max(0, config.audio.volume));
    }
  }

  const paletteMap = {
    olive: "--color-olive",
    oliveDeep: "--color-olive-deep",
    oliveSoft: "--color-olive-soft",
    ivory: "--color-ivory",
    paper: "--color-paper",
    paperDeep: "--color-paper-deep",
    sand: "--color-sand",
    gold: "--color-gold",
    ink: "--color-ink"
  };

  Object.entries(paletteMap).forEach(([key, cssVariable]) => {
    const value = config.palette[key];
    if (value) {
      root.style.setProperty(cssVariable, value);
    }
  });

  const startBackgroundAudio = () => {
    if (!backgroundAudio || !backgroundAudio.getAttribute("src") || isStartingAudio) {
      return;
    }

    isStartingAudio = true;

    const playPromise = backgroundAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        isStartingAudio = false;
      });
      playPromise.then(() => {
        isStartingAudio = false;
      });
      return;
    }

    isStartingAudio = false;
  };

  const openInvitation = () => {
    if (!opening || opening.classList.contains("is-open") || isOpening) {
      return;
    }

    startBackgroundAudio();
    isOpening = true;
    opening.classList.add("is-opening");

    window.setTimeout(() => {
      opening.classList.add("is-open");
    }, 2260);

    window.setTimeout(() => {
      document.body.classList.add("is-ready");
    }, 2660);

    window.setTimeout(() => {
      opening.classList.remove("is-opening");
      isOpening = false;
    }, 2880);
  };

  openInvitationButton?.addEventListener("click", openInvitation);
  openInvitationButton?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openInvitation();
    }
  });
})();
