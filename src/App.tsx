import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { dAppKit } from './dapp-kit';
import GreetingManager from './components/GreetingManager';
import WalletStatus from './components/WalletStatus';

export default function App() {
	return (
		<DAppKitProvider dAppKit={dAppKit}>
			<div className="min-h-screen bg-[radial-gradient(circle_at_top_left, rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(249,115,22,0.14),_transparent_20%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] px-4 py-8 text-slate-900 md:px-8 md:py-12">
				<div className="mx-auto max-w-6xl">
					<header className="mb-8 rounded-[2rem]border border-white/60 bg-white/75 p-6 shadow-[0_24px_100px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
						<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
							<div className="max-w-3xl">
								<p className="mb-3 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
									ITC Hello Move
								</p>
								<h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
									Sui Greeting dApp cho testnet
								</h1>
								<p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
									Trang nay cho phep ban ket noi vi, tao shared object `Greeting`, cap nhat text,
									va mo nhanh transaction hoac object tren Sui Explorer.
								</p>
							</div>

							<div className="rounded-[1.5rem]border border-slate-200 bg-slate-50 p-3">
								<ConnectButton />
							</div>
						</div>
					</header>

					<div className="space-y-6">
						<WalletStatus />
						<GreetingManager />
					</div>
				</div>
			</div>
		</DAppKitProvider>
	);
}
