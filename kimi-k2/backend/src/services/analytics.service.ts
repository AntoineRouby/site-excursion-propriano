import Mixpanel from 'mixpanel';
import { Analytics } from '@segment/analytics-node';

export class AnalyticsService {
  private mixpanel: Mixpanel;
  private segment: Analytics;

  constructor() {
    this.mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN!);
    this.segment = new Analytics({
      writeKey: process.env.SEGMENT_WRITE_KEY!,
    });
  }

  trackReservationCreated(userId: string, properties: any) {
    this.mixpanel.track('Reservation Created', {
      distinct_id: userId,
      ...properties,
    });

    this.segment.track({
      userId,
      event: 'Reservation Created',
      properties,
    });
  }

  trackCheckIn(userId: string, reservationId: string) {
    this.mixpanel.track('Check-in Completed', {
      distinct_id: userId,
      reservationId,
    });
  }

  trackRevenue(amount: number, properties: any) {
    this.mixpanel.track('Purchase', {
      revenue: amount,
      ...properties,
    });
  }
}