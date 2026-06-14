use crate::{
    access_control::role_oracle, Error, RefundManager, RefundManagerClient,
};
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup_refund_manager(env: &Env) -> (Address, RefundManagerClient<'_>) {
    let contract_id = env.register(RefundManager, ());
    let client = RefundManagerClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let token_admin = Address::generate(env);
    let usdc_token = env
        .register_stellar_asset_contract_v2(token_admin)
        .address();

    client.initialize_refund_manager(&admin, &usdc_token);

    (admin, client)
}

#[test]
fn test_process_due_subscriptions_operator_gets_zero_when_none_due() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, client) = setup_refund_manager(&env);
    let operator = Address::generate(&env);

    client.grant_role(&admin, &role_oracle(&env), &operator);

    // TODO(#302): add a full due-subscription processing test once the
    // subscription processor implementation is complete.
    let processed = client.process_due_subscriptions(&operator);

    assert_eq!(processed, 0);
}

#[test]
fn test_process_due_subscriptions_rejects_non_operator() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_refund_manager(&env);
    let non_operator = Address::generate(&env);

    let result = client.try_process_due_subscriptions(&non_operator);

    assert_eq!(result, Err(Ok(Error::Unauthorized)));
}
