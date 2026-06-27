import { NetworkProfileSwitcher, NetworkEnvironment } from "../network-profiles.js";
import { withMappedContractError, FeeConfig } from "../index.js";

export interface MerchantRegistryConfig {
  network: NetworkEnvironment;
  rpcUrl?: string;
  contractId: string;
}

export interface RegisterMerchantParams {
  merchantId: string;
  businessName: string;
  settlementCurrency: string;
  payoutAddress?: string;
  bankAccount?: string;
  feeConfig?: FeeConfig;
}

export interface UpdateMerchantParams {
  merchantId: string;
  businessName?: string;
  settlementCurrency?: string;
  active?: boolean;
  payoutAddress?: string;
  bankAccount?: string;
  feeConfig?: FeeConfig;
}

/**
 * MerchantRegistryClient provides a high-level interface for interacting with the MerchantRegistry contract.
 * Manages merchant registration, verification, and account status operations.
 */
export class MerchantRegistryClient {
  private contract: any;
  public networkSwitcher: NetworkProfileSwitcher;
  private contractId: string;
  private rpcUrl: string;
  private networkPassphrase: string;

  constructor(config: MerchantRegistryConfig) {
    this.networkSwitcher = new NetworkProfileSwitcher(config.network);
    const profile = this.networkSwitcher.getProfile();
    this.rpcUrl = config.rpcUrl || profile.rpcUrl;
    this.networkPassphrase = profile.networkPassphrase;
    this.contractId = config.contractId;
    this.initializeContract();
  }

  private async initializeContract(): Promise<void> {
    // Contract will be lazily initialized on first use
  }

  private getContract(): any {
    if (!this.contract) {
      const { Client } = require("@stellar/stellar-sdk/contract");
      this.contract = new Client({
        networkPassphrase: this.networkPassphrase,
        rpcUrl: this.rpcUrl,
        contractId: this.contractId,
      });
    }
    return this.contract;
  }

  /**
   * Switch the client to a different network environment.
   */
  public switchNetwork(environment: NetworkEnvironment, contractId?: string): void {
    this.networkSwitcher.switchEnvironment(environment);
    const profile = this.networkSwitcher.getProfile();
    this.rpcUrl = profile.rpcUrl;
    this.networkPassphrase = profile.networkPassphrase;
    if (contractId) {
      this.contractId = contractId;
    }
    this.contract = undefined;
  }

  /**
   * Register a new merchant in the registry.
   */
  async registerMerchant(params: RegisterMerchantParams): Promise<void> {
    return withMappedContractError(() =>
      this.getContract().register_merchant({
        merchant_id: params.merchantId,
        business_name: params.businessName,
        settlement_currency: params.settlementCurrency,
        payout_address: params.payoutAddress,
        bank_account: params.bankAccount,
        fee_config: params.feeConfig,
      }),
    );
  }

  /**
   * Retrieve details of a specific merchant.
   */
  async getMerchant(merchantId: string): Promise<any> {
    return withMappedContractError(() =>
      this.getContract().get_merchant({
        merchant_id: merchantId,
      }),
    );
  }

  /**
   * Update merchant details.
   */
  async updateMerchant(params: UpdateMerchantParams): Promise<void> {
    return withMappedContractError(() =>
      this.getContract().update_merchant({
        merchant_id: params.merchantId,
        business_name: params.businessName,
        settlement_currency: params.settlementCurrency,
        active: params.active,
        payout_address: params.payoutAddress,
        bank_account: params.bankAccount,
        fee_config: params.feeConfig,
      }),
    );
  }

  /**
   * Suspend a merchant account, preventing further transactions.
   */
  async suspendMerchant(operator: string, merchantId: string): Promise<void> {
    return withMappedContractError(() =>
      this.getContract().suspend_merchant({
        operator: operator,
        merchant_id: merchantId,
      }),
    );
  }

  /**
   * Reinstate a suspended merchant account.
   */
  async reinstateMerchant(operator: string, merchantId: string): Promise<void> {
    return withMappedContractError(() =>
      this.getContract().reinstate_merchant({
        operator: operator,
        merchant_id: merchantId,
      }),
    );
  }

  /**
   * Verify a merchant's KYC status, enabling higher transaction limits.
   */
  async verifyMerchant(operator: string, merchantId: string): Promise<void> {
    return withMappedContractError(() =>
      this.getContract().verify_merchant({
        admin: operator,
        merchant_id: merchantId,
      }),
    );
  }
}
