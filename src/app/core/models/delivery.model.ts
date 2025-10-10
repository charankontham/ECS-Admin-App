import { BaseFilters } from './common.model';
import { AddressDto } from './order.model';

export interface DeliveryHubRequest {
  deliveryHubId?: number;
  deliveryHubName: string;
  deliveryHubAddressId?: number;
  dateAdded: Date;
  dateModified: Date;
}

export interface DeliveryHub {
  deliveryHubId: number;
  deliveryHubName: string;
  deliveryHubAddress?: AddressDto;
  dateAdded: Date;
  dateModified: Date;
}

export interface DeliveryAgent {
  deliveryAgentId?: number;
  deliveryAgentName: string;
  contactNumber: string;
  email: string;
  password?: string;
  availabilityStatus: number;
  rating?: number;
  totalDeliveries: number;
  servingArea: string;
  dateAdded?: Date;
  dateModified?: Date;
}

export interface DeliveryHubFilters extends BaseFilters {
  type: 'deliveryHub';
  deliveryHubName?: string | null;
  city?: string | null;
}

export interface DeliveryAgentFilters extends BaseFilters {
  type: 'deliveryAgent';
  servingArea?: string | null;
  availabilityStatus?: string | null;
  agentName?: string | null;
  agentRating?: number;
}
