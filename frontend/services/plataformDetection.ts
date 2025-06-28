// Detecção inteligente de plataforma
export class PlatformService {
  static isWeb(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined"
  }

  static isNative(): boolean {
    return !this.isWeb()
  }

  static isIOS(): boolean {
    if (this.isNative()) {
      // React Native
      const { Platform } = require("react-native")
      return Platform.OS === "ios"
    } else {
      // Web
      return /iPad|iPhone|iPod/.test(navigator.userAgent)
    }
  }

  static isAndroid(): boolean {
    if (this.isNative()) {
      // React Native
      const { Platform } = require("react-native")
      return Platform.OS === "android"
    } else {
      // Web
      return /Android/.test(navigator.userAgent)
    }
  }

  static getPlatformName(): string {
    if (this.isNative()) {
      return "app"
    } else {
      return "pwa"
    }
  }
}