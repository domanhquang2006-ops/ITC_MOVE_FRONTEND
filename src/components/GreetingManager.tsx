import { useState, type FormEvent } from 'react';
import { useCurrentAccount, useCurrentClient, useCurrentNetwork } from '@mysten/dapp-kit-react';
import { Transaction } from '@mysten/sui/transactions';
import { dAppKit } from '../dapp-kit';

const PACKAGE_ID = '0x7b930d57468c0a1a5765cd758f0160e4ca55680f9b28c0faf5f0372d5bda3075';
const MODULE_NAME = 'greeting';

function shortenId(value: string, start = 8, end = 6) {
	if (value.length <= start + end) {
		return value;
	}

	return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function getExplorerBaseUrl(network: string) {
	return `https://suiexplorer.com/?network=${network}`;
}

function getObjectExplorerUrl(network: string, objectId: string) {
	return `${getExplorerBaseUrl(network)}/object/${objectId}`;
}

function getTransactionExplorerUrl(network: string, digest: string) {
	return `${getExplorerBaseUrl(network)}/txblock/${digest}`;
}

function getPackageExplorerUrl(network: string, packageId: string) {
	return `${getExplorerBaseUrl(network)}/object/${packageId}`;
}

function extractCreatedGreetingId(result: unknown) {
	if (!result || typeof result !== 'object') {
		return null;
	}

	const maybeResult = result as {
		objectChanges?: Array<{
			type?: string;
			objectType?: string;
			objectId?: string;
		}>;
	};

	const createdGreeting = maybeResult.objectChanges?.find((change) => {
		return (
			change.type === 'created' &&
			change.objectType?.includes(`${PACKAGE_ID}::${MODULE_NAME}::Greeting`)
		);
	});

	return createdGreeting?.objectId ?? null;
}

function getTransactionDigest(
	result:
		| {
				$kind: 'Transaction';
				Transaction: { digest: string };
		}
		| {
				$kind: 'FailedTransaction';
				FailedTransaction: { digest: string };
		},
) {
	return result.$kind === 'Transaction' ? result.Transaction.digest : result.FailedTransaction.digest;
}

export default function GreetingManager() {
	const account = useCurrentAccount();
	const client = useCurrentClient();
	const network = useCurrentNetwork();
	const [greetingId, setGreetingId] = useState('');
	const [newText, setNewText] = useState('Xin chao ITC!');
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');
	const [lastDigest, setLastDigest] = useState('');
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const explorerNetwork = String(network);

	async function handleCreateGreeting() {
		if (!account) {
			setError('Hay ket noi vi truoc khi tao Greeting.');
			return;
		}

		setIsCreating(true);
		setError('');
		setLastDigest('');
		setStatus('Dang tao Greeting tren testnet...');

		try {
			const transaction = new Transaction();

			transaction.moveCall({
				target: `${PACKAGE_ID}::${MODULE_NAME}::new`,
			});

			const result = await dAppKit.signAndExecuteTransaction({ transaction });
			const digest = getTransactionDigest(result);
			setLastDigest(digest);
			const transactionResult = await client.waitForTransaction({
				digest,
				include: { effects: true, objectTypes: true },
			});
			const changedObjects =
				transactionResult.$kind === 'Transaction'
					? transactionResult.Transaction.effects?.changedObjects
					: transactionResult.FailedTransaction.effects?.changedObjects;
			const createdId =
				changedObjects?.find((changedObject) => {
					return (
						changedObject.idOperation === 'Created' &&
						changedObject.outputOwner?.$kind === 'Shared'
					);
				})?.objectId ?? extractCreatedGreetingId(transactionResult);

			if (createdId) {
				setGreetingId(createdId);
			}

			setStatus(
				createdId
					? `Tao Greeting thanh cong. Object ID: ${createdId}`
					: `Tao Greeting thanh cong. Digest: ${digest}`,
			);
		} catch (caughtError) {
			const message =
				caughtError instanceof Error ? caughtError.message : 'Khong the tao Greeting.';
			setError(message);
			setStatus('');
		} finally {
			setIsCreating(false);
		}
	}

	async function handleUpdateGreeting(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!account) {
			setError('Hay ket noi vi truoc khi cap nhat Greeting.');
			return;
		}

		if (!greetingId.trim()) {
			setError('Hay nhap Greeting object ID truoc khi update.');
			return;
		}

		if (!newText.trim()) {
			setError('Hay nhap noi dung moi truoc khi update.');
			return;
		}

		setIsUpdating(true);
		setError('');
		setLastDigest('');
		setStatus('Dang cap nhat text tren testnet...');

		try {
			const transaction = new Transaction();

			transaction.moveCall({
				target: `${PACKAGE_ID}::${MODULE_NAME}::update_text`,
				arguments: [transaction.object(greetingId.trim()), transaction.pure.string(newText)],
			});

			const result = await dAppKit.signAndExecuteTransaction({ transaction });
			const digest = getTransactionDigest(result);
			setLastDigest(digest);

			setStatus(`Cap nhat thanh cong. Digest: ${digest}`);
		} catch (caughtError) {
			const message =
				caughtError instanceof Error ? caughtError.message : 'Khong the cap nhat Greeting.';
			setError(message);
			setStatus('');
		} finally {
			setIsUpdating(false);
		}
	}

	return (
		<section className="rounded-[2rem]border border-white/60 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="max-w-2xl">
					<p className="mb-3 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
						Greeting Contract
					</p>
					<h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
						Tao shared object va update text ngay trong app
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
						Flow hien tai da noi voi package testnet cua ban. Sau khi tao Greeting, app se luu
						lai object ID de ban update tiep va mo nhanh tren Explorer.
					</p>
				</div>

				<a
					href={getPackageExplorerUrl(explorerNetwork, PACKAGE_ID)}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
				>
					Mo Package tren Explorer
				</a>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Network</p>
					<p className="mt-2 text-sm font-medium text-slate-900">{explorerNetwork}</p>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Module</p>
					<p className="mt-2 text-sm font-medium text-slate-900">{MODULE_NAME}</p>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Package ID</p>
					<p className="mt-2 break-all font-mono text-xs text-slate-700">{PACKAGE_ID}</p>
				</div>
			</div>

			<div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
				<div className="space-y-6">
					<div className="rounded-[1.5rem]border border-emerald-200 bg-emerald-50/70 p-5">
						<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div>
								<h3 className="text-lg font-semibold text-slate-900">1. Tao Greeting shared object</h3>
								<p className="mt-1 text-sm text-slate-600">
									Bam nut nay sau khi connect vi. App se gui transaction `greeting::new`.
								</p>
							</div>
							<button
								type="button"
								onClick={handleCreateGreeting}
								disabled={!account || isCreating || isUpdating}
								className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
							>
								{isCreating ? 'Dang tao...' : 'Tao Greeting'}
							</button>
						</div>
					</div>

					<form
						onSubmit={handleUpdateGreeting}
						className="rounded-[1.5rem]border border-amber-200 bg-amber-50/60 p-5"
					>
						<div className="mb-5">
							<h3 className="text-lg font-semibold text-slate-900">2. Cap nhat text</h3>
							<p className="mt-1 text-sm text-slate-600">
								Nhap object ID da tao va noi dung moi, sau do gui `greeting::update_text`.
							</p>
						</div>

						<div className="space-y-4">
							<div>
								<label
									htmlFor="greeting-id"
									className="mb-2 block text-sm font-medium text-slate-700"
								>
									Greeting object ID
								</label>
								<input
									id="greeting-id"
									value={greetingId}
									onChange={(event) => setGreetingId(event.target.value)}
									placeholder="0x..."
									className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
								/>
							</div>

							<div>
								<label htmlFor="new-text" className="mb-2 block text-sm font-medium text-slate-700">
									Noi dung moi
								</label>
								<input
									id="new-text"
									value={newText}
									onChange={(event) => setNewText(event.target.value)}
									placeholder="Xin chao ITC!"
									className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
								/>
							</div>
						</div>

						<div className="mt-5 flex flex-col gap-3 sm:flex-row">
							<button
								type="submit"
								disabled={!account || isCreating || isUpdating}
								className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
							>
								{isUpdating ? 'Dang cap nhat...' : 'Cap nhat text'}
							</button>

							{greetingId ? (
								<a
									href={getObjectExplorerUrl(explorerNetwork, greetingId)}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
								>
									Mo Object tren Explorer
								</a>
							) : null}
						</div>
					</form>
				</div>

				<div className="space-y-4">
					<div className="rounded-[1.5rem]border border-slate-200 bg-slate-950 p-5 text-slate-50">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Vi hien tai</p>
						{account ? (
							<>
								<p className="mt-3 text-sm text-slate-300">San sang ky transaction tren testnet.</p>
								<p className="mt-4 break-all font-mono text-xs leading-6 text-slate-100">
									{account.address}
								</p>
							</>
						) : (
							<p className="mt-3 text-sm text-slate-300">Hay connect vi de bat dau giao dich.</p>
						)}
					</div>

					<div className="rounded-[1.5rem]border border-slate-200 bg-white p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Ket qua moi nhat</p>
						{status ? <p className="mt-3 text-sm leading-6 text-slate-700">{status}</p> : null}
						{error ? (
							<p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
								{error}
							</p>
						) : null}
						{!status && !error ? (
							<p className="mt-3 text-sm text-slate-500">
								Sau khi ban gui transaction, digest va object ID se hien o day.
							</p>
						) : null}
					</div>

					<div className="rounded-[1.5rem]border border-slate-200 bg-white p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Explorer Links</p>
						<div className="mt-4 space-y-4 text-sm">
							<div>
								<p className="mb-1 text-slate-500">Greeting Object ID</p>
								{greetingId ? (
									<>
										<p className="break-all font-mono text-xs text-slate-800">{greetingId}</p>
										<a
											href={getObjectExplorerUrl(explorerNetwork, greetingId)}
											target="_blank"
											rel="noreferrer"
											className="mt-2 inline-flex text-sm font-medium text-sky-700 hover:text-sky-900"
										>
											Mo object {shortenId(greetingId)}
										</a>
									</>
								) : (
									<p className="text-slate-500">Chua co object ID. Tao Greeting truoc.</p>
								)}
							</div>

							<div>
								<p className="mb-1 text-slate-500">Transaction Digest</p>
								{lastDigest ? (
									<>
										<p className="break-all font-mono text-xs text-slate-800">{lastDigest}</p>
										<a
											href={getTransactionExplorerUrl(explorerNetwork, lastDigest)}
											target="_blank"
											rel="noreferrer"
											className="mt-2 inline-flex text-sm font-medium text-sky-700 hover:text-sky-900"
										>
											Mo transaction {shortenId(lastDigest)}
										</a>
									</>
								) : (
									<p className="text-slate-500">Chua co transaction nao duoc luu.</p>
								)}
							</div>

							<div>
								<p className="mb-1 text-slate-500">Package</p>
								<p className="break-all font-mono text-xs text-slate-800">{PACKAGE_ID}</p>
								<a
									href={getPackageExplorerUrl(explorerNetwork, PACKAGE_ID)}
									target="_blank"
									rel="noreferrer"
									className="mt-2 inline-flex text-sm font-medium text-sky-700 hover:text-sky-900"
								>
									Mo package {shortenId(PACKAGE_ID)}
								</a>
							</div>
						</div>
					</div>

					<div className="rounded-[1.5rem]border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
						<p className="font-medium text-slate-900">Cach dung nhanh</p>
						<p className="mt-2">1. Connect vi testnet.</p>
						<p>2. Bam `Tao Greeting` de tao shared object.</p>
						<p>3. Copy object ID hoac dung san ID vua duoc dien vao form.</p>
						<p>4. Nhap text moi va bam `Cap nhat text`.</p>
					</div>
				</div>
			</div>
		</section>
	);
}
