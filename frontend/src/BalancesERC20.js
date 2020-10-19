import React, { useEffect, useState } from 'react';
import { Table, Grid, Button } from 'semantic-ui-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSubstrate } from './substrate-lib';

import { Abi, ContractPromise } from '@polkadot/api-contract';

import { apiContract, gasLimit } from './utils/apiContract';

export default function Main (props) {
  const { api, keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const [balances, setBalances] = useState({});

  const contract = apiContract(api);

  const balanceOf = async (who) => {
    const result = await contract.query.balanceOf(who, 0, gasLimit, who);

    return result.output.toString();
  };

  const updateBalances = async () => {
    const balances = [];

    const pairs = await keyring.getPairs();

    await Promise.all(pairs.map(async (pair) => {
      balances[pair.address] = await balanceOf(pair.address);
    }));

    setBalances(balances);
  };

  const displayBalance = (balance) => {
    return balance.toString() + ' Tokens';
  };

  useEffect(() => {
    const addresses = keyring.getPairs().map(account => account.address);
    let unsubscribeAll = null;

    api.query.system.account
      .multi(addresses, balances => {
        updateBalances(addresses)
      }).then(unsub => {
        unsubscribeAll = unsub;
      }).catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring, setBalances]);

  return (
    <Grid.Column>
      <h1>Balances ERC20</h1>
      <Table celled striped size='small'>
        <Table.Body>{accounts.map(account =>
          <Table.Row key={account.address}>
            <Table.Cell width={3} textAlign='right'>{account.meta.name}</Table.Cell>
            <Table.Cell width={10}>
              <span style={{ display: 'inline-block', minWidth: '31em' }}>
                {account.address}
              </span>
              <CopyToClipboard text={account.address}>
                <Button
                  basic
                  circular
                  compact
                  size='mini'
                  color='blue'
                  icon='copy outline'
                />
              </CopyToClipboard>
            </Table.Cell>
            <Table.Cell width={3}>
              {
                balances && balances[account.address] &&
                displayBalance(balances[account.address])
              }
            </Table.Cell>
          </Table.Row>
        )}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}
