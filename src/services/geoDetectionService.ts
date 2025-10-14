/**
 * Geo-detection service using IP-based location detection
 * This uses public APIs that don't require cookie consent as they only process IP addresses
 * which are necessary for basic network communication.
 */

interface GeoLocation {
  country_code: string;
  country_name: string;
}

class GeoDetectionService {
  private detectedLocation: GeoLocation | null = null;
  private detectionAttempted = false;

  /**
   * Detect user's country based on IP address
   * Uses multiple fallback services for reliability
   * No cookies required - only uses IP address which is publicly visible
   */
  async detectCountry(): Promise<string | null> {
    // Return cached result if already detected
    if (this.detectionAttempted) {
      return this.detectedLocation?.country_code || null;
    }

    this.detectionAttempted = true;

    try {
      // Try primary service: ipapi.co (free, no registration, GDPR compliant)
      const result = await this.tryIpapiCo();
      if (result) {
        this.detectedLocation = result;
        return result.country_code;
      }
    } catch (error) {
      console.warn('Primary geo-detection failed, trying fallback...', error);
    }

    try {
      // Fallback service: ip-api.com (free, no registration)
      const result = await this.tryIpApi();
      if (result) {
        this.detectedLocation = result;
        return result.country_code;
      }
    } catch (error) {
      console.warn('Fallback geo-detection failed', error);
    }

    // All detection methods failed
    return null;
  }

  /**
   * Primary detection using ipapi.co
   * Free tier: 30,000 requests/month
   */
  private async tryIpapiCo(): Promise<GeoLocation | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    try {
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.country_code) {
        return {
          country_code: data.country_code,
          country_name: data.country_name || data.country_code,
        };
      }

      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Fallback detection using ip-api.com
   * Free tier: 45 requests/minute
   */
  private async tryIpApi(): Promise<GeoLocation | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    try {
      const response = await fetch('http://ip-api.com/json/', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.status === 'success' && data.countryCode) {
        return {
          country_code: data.countryCode,
          country_name: data.country || data.countryCode,
        };
      }

      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get the detected location (if available)
   */
  getDetectedLocation(): GeoLocation | null {
    return this.detectedLocation;
  }

  /**
   * Reset detection state (useful for testing)
   */
  reset(): void {
    this.detectedLocation = null;
    this.detectionAttempted = false;
  }
}

export const geoDetectionService = new GeoDetectionService();
