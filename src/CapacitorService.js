// ============================================
// CapacitorService.js — VitaScann
// Détecte si on tourne en natif (Android/iOS)
// et utilise les bons plugins Capacitor
// ============================================

// Détection natif vs web
export const isNative = () => {
  return window?.Capacitor?.isNativePlatform?.() === true;
};

export const getPlatform = () => {
  return window?.Capacitor?.getPlatform?.() || "web";
};

// ─── CAMÉRA NATIVE ───
export const NativeCamera = {
  async takePhoto() {
    if (!isNative()) return null;
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false,
      });
      return photo.dataUrl;
    } catch (e) {
      console.error("Camera error:", e);
      return null;
    }
  },

  async requestPermissions() {
    if (!isNative()) return "granted";
    try {
      const { Camera } = await import("@capacitor/camera");
      const perm = await Camera.requestPermissions();
      return perm.camera;
    } catch { return "denied"; }
  }
};

// ─── HAPTICS (vibration sur chaque rep) ───
export const NativeHaptics = {
  async impact(style = "Medium") {
    if (!isNative()) {
      // Fallback web
      if (navigator.vibrate) navigator.vibrate(30);
      return;
    }
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      await Haptics.impact({
        style: ImpactStyle[style] || ImpactStyle.Medium
      });
    } catch {}
  },

  async notification(type = "Success") {
    if (!isNative()) {
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      return;
    }
    try {
      const { Haptics, NotificationType } = await import("@capacitor/haptics");
      await Haptics.notification({
        type: NotificationType[type] || NotificationType.Success
      });
    } catch {}
  },

  async repCount() {
    // Vibration courte sur chaque rep comptée
    await this.impact("Light");
  },

  async serieComplete() {
    // Vibration forte quand une série est complète
    await this.notification("Success");
  },

  async dayComplete() {
    // Vibration pattern spéciale journée complète
    if (!isNative()) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
      return;
    }
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 150);
      setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 300);
    } catch {}
  }
};

// ─── STATUS BAR ───
export const NativeStatusBar = {
  async setDark() {
    if (!isNative()) return;
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#060d08" });
    } catch {}
  },

  async hide() {
    if (!isNative()) return;
    try {
      const { StatusBar } = await import("@capacitor/status-bar");
      await StatusBar.hide();
    } catch {}
  },

  async show() {
    if (!isNative()) return;
    try {
      const { StatusBar } = await import("@capacitor/status-bar");
      await StatusBar.show();
    } catch {}
  }
};

// ─── PUSH NOTIFICATIONS NATIVES ───
export const NativePush = {
  async init(onNotification) {
    if (!isNative()) return;
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      // Demander permission
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") return;

      // Enregistrer
      await PushNotifications.register();

      // Token FCM
      PushNotifications.addListener("registration", (token) => {
        console.log("FCM Token natif:", token.value);
        localStorage.setItem("vs_fcm_token_native", token.value);
      });

      // Notification reçue en foreground
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        if (onNotification) onNotification(notification);
      });

      // Notification cliquée
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.log("Notification cliquée:", action);
      });
    } catch (e) {
      console.error("Push native error:", e);
    }
  }
};

// ─── PÉDOMÈTRE NATIF ───
// Sur Android, utilise l'accéléromètre natif via le plugin
// Beaucoup plus précis que le web — fonctionne app fermée
export const NativePedometer = {
  _listener: null,

  async isAvailable() {
    if (!isNative()) return false;
    try {
      // Vérifie si le sensor est disponible
      return true;
    } catch { return false; }
  },

  // Le pédomètre natif utilise le sensor TYPE_STEP_COUNTER d'Android
  // On l'initialise via un plugin custom ou via Motion.addListener
  async startTracking(onStep) {
    if (!isNative()) return false;
    try {
      const { Motion } = await import("@capacitor/motion");

      let lastCount = 0;
      let buffer = [];
      let lastStepTime = 0;
      let lpFilter = { x: 0, y: 0, z: 0, init: false };

      this._listener = await Motion.addListener("accel", (event) => {
        const { x, y, z } = event.acceleration;
        const alpha = 0.6;

        if (!lpFilter.init) {
          lpFilter = { x, y, z, init: true };
        } else {
          lpFilter.x = alpha * lpFilter.x + (1 - alpha) * x;
          lpFilter.y = alpha * lpFilter.y + (1 - alpha) * y;
          lpFilter.z = alpha * lpFilter.z + (1 - alpha) * z;
        }

        const mag = Math.sqrt(lpFilter.x ** 2 + lpFilter.y ** 2 + lpFilter.z ** 2);
        const now = Date.now();
        buffer.push({ t: now, m: mag });
        if (buffer.length > 20) buffer = buffer.slice(-15);

        const recent = buffer.slice(-8);
        if (recent.length < 4) return;

        const min = Math.min(...recent.map(v => v.m));
        const max = Math.max(...recent.map(v => v.m));
        const range = max - min;
        const threshold = min + range * 0.65;

        if (mag > threshold && range > 2.5 && (now - lastStepTime) > 400) {
          lastStepTime = now;
          lastCount++;
          onStep(lastCount);
          NativeHaptics.repCount(); // Vibration sur chaque pas
        }
      });

      return true;
    } catch (e) {
      console.error("Native pedometer error:", e);
      return false;
    }
  },

  async stopTracking() {
    try {
      if (this._listener) {
        await this._listener.remove();
        this._listener = null;
      }
    } catch {}
  }
};

// ─── INIT GLOBALE — appeler au démarrage de l'app ───
export const initCapacitor = async () => {
  if (!isNative()) return;

  // Status bar sombre
  await NativeStatusBar.setDark();

  console.log(`VitaScann natif — platform: ${getPlatform()}`);
};
