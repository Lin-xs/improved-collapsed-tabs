(function () {
  const Services =
    globalThis.Services ?? ChromeUtils.importESModule("resource://gre/modules/Services.sys.mjs").Services;
  const prefName = "uc.theme.toolbar-float.modifier-key";
  const activeAttribute = "uc-theme-toolbar-key-active";

  let modifierKey = Services.prefs.getCharPref(prefName, "Alt");

  function updateModifierKey() {
    modifierKey = Services.prefs.getCharPref(prefName, "Alt");
    document.documentElement.removeAttribute(activeAttribute);
  }

  function isConfiguredModifier(event) {
    return event.key === modifierKey || event.getModifierState(modifierKey);
  }

  function onKeyDown(event) {
    if (isConfiguredModifier(event)) {
      document.documentElement.setAttribute(activeAttribute, "true");
    }
  }

  function onKeyUp(event) {
    if (event.key === modifierKey || !event.getModifierState(modifierKey)) {
      document.documentElement.removeAttribute(activeAttribute);
    }
  }

  const prefObserver = {
    observe(_subject, topic, data) {
      if (topic === "nsPref:changed" && data === prefName) {
        updateModifierKey();
      }
    },
  };

  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  window.addEventListener("blur", () => document.documentElement.removeAttribute(activeAttribute));
  Services.prefs.addObserver(prefName, prefObserver);

  window.addEventListener(
    "unload",
    () => {
      Services.prefs.removeObserver(prefName, prefObserver);
      document.documentElement.removeAttribute(activeAttribute);
    },
    { once: true }
  );
})();
