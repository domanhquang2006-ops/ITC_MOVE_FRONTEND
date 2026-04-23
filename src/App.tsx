<<<<<<< HEAD
// App.tsx
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { dAppKit } from './dapp-kit';
import WalletStatus from './components/WalletStatus';

export default function App() {
	return (
		<DAppKitProvider dAppKit={dAppKit}>
			<div>
				<h1>My Sui dApp</h1>
				<ConnectButton />
				<WalletStatus/>
			</div>
		</DAppKitProvider>
	);
}
=======
function App() {

  return (
    <>
      <h1 className="text-red-500">Hello World</h1>
    </>
  )
}

export default App
>>>>>>> 084f0bc076a555d84f326ed30de4f6cdc6825f85
