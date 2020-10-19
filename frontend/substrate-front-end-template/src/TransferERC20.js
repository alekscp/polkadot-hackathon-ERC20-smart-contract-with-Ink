import React, { useState, useEffect } from 'react';
import { Form, Input, Grid, Label, Icon, Button } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { apiContract, gasLimit } from './utils/apiContract';

function Main (props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const contract = apiContract(api);

  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: 'user'
  }));

  const [formState, setFormState] = useState({addressTo: null, amount: 0});
  const [balance, setBalance] = useState(0);

  const onChange = (_, data) => setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { addressTo, amount } = formState;

  const onSelectAddressTo = address => setFormState(prev => ({ ...prev, 'addressTo': address }));

  const transfer = () => {
    contract.tx.transfer(0, gasLimit, addressTo, amount).signAndSend(accountPair, (result) => {
      updateBalance();
    });
  }

  const updateBalance = () => {
    contract.query.balanceOf(accountPair.address, 0, gasLimit, accountPair.address).then((balance) => {
      setBalance(balance.output.toNumber());
    })
  }

  useEffect(() => {
    let unsubscribe;

    contract.query.totalSupply(keyring.getPairs()[0].address, 0, gasLimit).then((total) => {
      setTotalSupply(total.output.toNumber());
      updateBalance();
    }).then(unsub => {
      unsubscribe = unsub;
    }).catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [accountPair]);

  return (
    <Grid.Column width={8}>
      <h1>Transfer of ERC20 Tokens</h1>
      <Form>
        <Form.Field>
          <Label basic color='teal'>
            <Icon name='hand point right' />
            1 Unit = 1000000000000
          </Label>
        </Form.Field>
        <Form.Field>Transfer more than the existential amount for account with 0 balance</Form.Field>
        <Form.Field>
          <Input
            fluid
            label='To'
            type='text'
            placeholder='address'
            state='addressTo'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='Amount'
            type='number'
            state='amount'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <Button onClick={transfer}>Transfer!</Button>
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function TransferERC20 (props) {
  const {api} = useSubstrate();
  const {accountPair} = props;
  return (api.registry && accountPair ? <Main {...props} /> : null);
}
