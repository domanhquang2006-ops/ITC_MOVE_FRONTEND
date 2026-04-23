import { useCurrentAccount, useCurrentWallet, useCurrentNetwork } from '@mysten/dapp-kit-react';

function WalletStatus() {
	const account = useCurrentAccount();
	const wallet = useCurrentWallet();
	const network = useCurrentNetwork();

	if (!account) {
		return (
			<div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-600">
				Connect wallet de bat dau goi smart contract tren {String(network)}.
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<div className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wallet</p>
				<p className="mt-3 text-sm font-medium text-slate-900">{wallet?.name}</p>
			</div>
			<div className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Address</p>
				<p className="mt-3 break-all font-mono text-xs leading-6 text-slate-800">{account.address}</p>
			</div>
			<div className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Network</p>
				<p className="mt-3 text-sm font-medium text-slate-900">{String(network)}</p>
			</div>
		</div>
	);
}

export default WalletStatus;
