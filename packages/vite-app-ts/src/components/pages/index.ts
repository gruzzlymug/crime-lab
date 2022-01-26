import { lazier } from 'eth-hooks/helpers';

// the components and pages are lazy loaded for performance and bundle size reasons
// code is in the component file

export const ExampleUI = lazier(() => import('./exampleui/ExampleUI'), 'ExampleUI');
export const Checkout = lazier(() => import('./checkout/Checkout'), 'Checkout');
export const Subgraph = lazier(() => import('./subgraph/Subgraph'), 'Subgraph');
export const Hints = lazier(() => import('./hints/Hints'), 'Hints');
export const CrimeLab = lazier(() => import('./crimelab/CrimeLab'), 'CrimeLab');
export const MinimalGame = lazier(() => import('./minimalgame/MinimalGame'), 'MinimalGame');
export const Lobby = lazier(() => import('./crimes/Lobby'), 'Lobby');
export const Crime = lazier(() => import('./crimes/Crime'), 'Crime');