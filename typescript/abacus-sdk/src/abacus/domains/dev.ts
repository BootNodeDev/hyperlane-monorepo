import { AbacusDomain } from './domain';

export const alfajores: AbacusDomain = {
  name: 'alfajores',
  id: 1000,
  bridgeRouter: '0x684C74fBA4dF7F7A542709C5f9688AB806C7B828',
  home: '0xeA057840858645bb68134a913A252a44a0C58652',
  replicas: [
    { domain: 5, address: '0x3354D5956612C38D0dD831dcdf83CF30BC674231' },
    { domain: 3000, address: '0x6AdB8ba7C826d70506D26eDdc74236fB88Fa647F' },
    { domain: 43113, address: '0x570EDeF0c271E3f1ba6B5C66D040195750a79762' },
    { domain: 80001, address: '0xbA00eF80A55d4EefcF3d7971270D2c233F9d315e' },
  ],
  governanceRouter: '0xBF79333049D140fCa12355f1F896c8ebedAf8707',
  xAppConnectionManager: '0x2d230eB17F3AFe032809EC13A0E516E297b17AA3',
};

export const kovan: AbacusDomain = {
  name: 'kovan',
  id: 3000,
  bridgeRouter: '0x53d09A4B49443F7f7C66321C306601dC9d483D4F',
  ethHelper: '0xFE7c9Cc7116429Ae50823a218315C7E01EC7A761',
  home: '0xc53F82FAF17B4c521A85C514791593847Bdf1655',
  replicas: [
    { domain: 5, address: '0xc501ad2163Ebd9921B4a6E46B344Ef7bA76A2cBa' },
    { domain: 1000, address: '0xEdDA4762fe6388C69d37b8Ee15B1deC10cA3B964' },
    { domain: 43113, address: '0xf3855B99b7cEfa56C66f0C2d0550b545df11d54A' },
    { domain: 80001, address: '0xeAc82476aF67dca63B04a66EA8D7230EfB4028DB' },
  ],
  governanceRouter: '0x11E94700D9E5Ab1F8Bd0b3bd13e331CEFe3acEB7',
  xAppConnectionManager: '0xf9db87020527A5A5aeFd95099051Fb14058916C9',
};

export const gorli: AbacusDomain = {
  name: 'gorli',
  id: 5,
  bridgeRouter: '0x53d09A4B49443F7f7C66321C306601dC9d483D4F',
  ethHelper: '0xFE7c9Cc7116429Ae50823a218315C7E01EC7A761',
  home: '0xc53F82FAF17B4c521A85C514791593847Bdf1655',
  replicas: [
    { domain: 1000, address: '0xEdDA4762fe6388C69d37b8Ee15B1deC10cA3B964' },
    { domain: 3000, address: '0xc501ad2163Ebd9921B4a6E46B344Ef7bA76A2cBa' },
    { domain: 43113, address: '0xf3855B99b7cEfa56C66f0C2d0550b545df11d54A' },
    { domain: 80001, address: '0xeAc82476aF67dca63B04a66EA8D7230EfB4028DB' },
  ],
  governanceRouter: '0x11E94700D9E5Ab1F8Bd0b3bd13e331CEFe3acEB7',
  xAppConnectionManager: '0xf9db87020527A5A5aeFd95099051Fb14058916C9',
};

export const fuji: AbacusDomain = {
  name: 'fuji',
  id: 43113,
  bridgeRouter: '0xFE7c9Cc7116429Ae50823a218315C7E01EC7A761',
  ethHelper: '0x7B99a9cf26c9813b16E3DDb3D6E593c3624c9EBA',
  home: '0xc53F82FAF17B4c521A85C514791593847Bdf1655',
  replicas: [
    { domain: 5, address: '0xf3855B99b7cEfa56C66f0C2d0550b545df11d54A' },
    { domain: 1000, address: '0xEdDA4762fe6388C69d37b8Ee15B1deC10cA3B964' },
    { domain: 3000, address: '0xc501ad2163Ebd9921B4a6E46B344Ef7bA76A2cBa' },
    { domain: 80001, address: '0xeAc82476aF67dca63B04a66EA8D7230EfB4028DB' },
  ],
  governanceRouter: '0x11E94700D9E5Ab1F8Bd0b3bd13e331CEFe3acEB7',
  xAppConnectionManager: '0xf9db87020527A5A5aeFd95099051Fb14058916C9',
};

export const mumbai: AbacusDomain = {
  name: 'mumbai',
  id: 80001,
  paginate: {
    // eth_getLogs and eth_newFilter are limited to a 10,000 blocks range
    blocks: 10000,
    from: 22900000,
  },
  bridgeRouter: '0xFE7c9Cc7116429Ae50823a218315C7E01EC7A761',
  ethHelper: '0x7B99a9cf26c9813b16E3DDb3D6E593c3624c9EBA',
  home: '0xc53F82FAF17B4c521A85C514791593847Bdf1655',
  replicas: [
    { domain: 5, address: '0xf3855B99b7cEfa56C66f0C2d0550b545df11d54A' },
    { domain: 1000, address: '0xEdDA4762fe6388C69d37b8Ee15B1deC10cA3B964' },
    { domain: 3000, address: '0xc501ad2163Ebd9921B4a6E46B344Ef7bA76A2cBa' },
    { domain: 43113, address: '0xeAc82476aF67dca63B04a66EA8D7230EfB4028DB' },
  ],
  governanceRouter: '0x11E94700D9E5Ab1F8Bd0b3bd13e331CEFe3acEB7',
  xAppConnectionManager: '0xf9db87020527A5A5aeFd95099051Fb14058916C9',
};

export const devDomains = [alfajores, kovan, gorli, fuji, mumbai];
