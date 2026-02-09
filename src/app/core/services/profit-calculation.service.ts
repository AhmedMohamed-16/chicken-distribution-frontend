import { Injectable } from "@angular/core";
import { DailyOperation, Partner, PartnerProfit, VehicleProfitSummary } from "../models";

@Injectable({ providedIn: 'root' })
export class ProfitCalculationService {

  /**
   * Calculate profit per vehicle
   * Backend Reference: Section 5 - Profit Calculation Logic
   */
  calculateVehicleProfits(operation: DailyOperation): VehicleProfitSummary[] {
    const vehicles = operation.vehicles ?? [];

    return vehicles.map(vehicle => {
      // Sum revenue for this vehicle
      const revenue = this.sumTransactionsByVehicle(
        operation.sale_transactions || [],
        vehicle.id,
        'total_amount'
      );

      // Sum purchases for this vehicle
      const purchases = this.sumTransactionsByVehicle(
        operation.farm_transactions || [],
        vehicle.id,
        'total_amount'
      );

      // Sum losses for this vehicle
      const losses = this.sumTransactionsByVehicle(
        operation.transport_losses || [],
        vehicle.id,
        'loss_amount'
      );

      // Vehicle-specific costs
      const vehicleCosts = (operation.daily_costs || [])
        .filter(c => c.vehicle_id === vehicle.id && c.cost_category?.is_vehicle_cost)
        .reduce((sum, c) => sum + c.amount, 0);

      // Share of shared costs (split equally among vehicles)
      const sharedCosts = (operation.daily_costs || [])
        .filter(c => !c.cost_category?.is_vehicle_cost)
        .reduce((sum, c) => sum + c.amount, 0);


      const otherCostsShare =
        vehicles.length > 0 ? sharedCosts / vehicles.length : 0;
      // Net profit for this vehicle
      const netProfit = revenue - purchases - losses - vehicleCosts - otherCostsShare;

      return {
        vehicle_id: vehicle.id,
        vehicle,
        revenue,
        purchases,
        losses,
        vehicle_costs: vehicleCosts,
        other_costs_share: otherCostsShare,
        net_profit: netProfit
      };
    });
  }

  /**
   * Distribute profit to partners for a specific vehicle
   * Backend Reference: Section 5 - Partner Distribution Algorithm
   */
  distributeVehicleProfitToPartners(
    vehicleSummary: VehicleProfitSummary,
    allPartners: Partner[]
  ): PartnerProfit[] {
    const vehicle = vehicleSummary.vehicle!;

    return allPartners.map(partner => {
      // Check if this partner invested in this vehicle
      // const vehiclePartnership = partner.vehicle_partnerships?.find(
      //   vp => vp.vehicle_id === vehicle.id
      // );
const vehiclePartnership=0;
      const isVehiclePartner = !!vehiclePartnership;

      // Base profit share based on investment percentage
      const baseShare = vehicleSummary.net_profit * (partner.investment_percentage / 100);

      // ✅ CRITICAL: Non-vehicle partners pay vehicle costs from their profit
      // Backend Artifact Reference: "Vehicle costs: Split among vehicle partners only"
      const vehicleCostShare = isVehiclePartner
        ? 0  // Vehicle partners already paid via total costs
        : vehicleSummary.vehicle_costs * (partner.investment_percentage / 100);

      const finalProfit = baseShare - vehicleCostShare;

      return {
        partner_id: partner.id,
        partner,
        vehicle_id: vehicle.id,
        base_profit_share: baseShare,
        vehicle_cost_share: vehicleCostShare,
        final_profit: finalProfit
      } as PartnerProfit;
    });
  }

  /**
   * Aggregate partner profits across all vehicles
   */
  aggregatePartnerProfits(
    vehicleSummaries: VehicleProfitSummary[],
    allPartners: Partner[]
  ): Map<number, PartnerProfit> {
    const aggregated = new Map<number, PartnerProfit>();

    vehicleSummaries.forEach(summary => {
      const vehicleProfits = this.distributeVehicleProfitToPartners(summary, allPartners);

      vehicleProfits.forEach(vp => {
        const existing = aggregated.get(vp.partner_id);

        if (existing) {
          existing.base_profit_share += vp.base_profit_share;
          existing.vehicle_cost_share += vp.vehicle_cost_share;
          existing.final_profit += vp.final_profit;
        } else {
          aggregated.set(vp.partner_id, { ...vp });
        }
      });
    });

    return aggregated;
  }

  private sumTransactionsByVehicle(
    transactions: any[],
    vehicleId: number,
    field: string
  ): number {
    return transactions
      .filter(t => t.vehicle_id === vehicleId)
      .reduce((sum, t) => sum + (t[field] || 0), 0);
  }
}
