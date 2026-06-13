import { AppIcon } from '../../../components/icons/AppIcon';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAccount,
  useDisconnect,
  useReadContract,
  useGasPrice,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useOpenConnectModal } from '../../../hooks/useOpenConnectModal';
import { TITAN_CONTRACTS } from '../../../config/my-titan-contracts';
import RegisterABI from '../../../abis/Register-titan.json';
import { formatEther, decodeEventLog } from 'viem';
import { CURRENT_NETWORK_INFO } from '../../../config/networks';
import { GlassButton, GlassCard } from '../../../components/ui/glass';
import { formatAddressForDisplay } from '../../../utils/addressValidation';
import { SafePalDappBrowserButton } from '../../../components/wallet/SafePalDappBrowserButton';
import { useIsWalletRegistered } from '../../../hooks/useIsWalletRegistered';
import { useWalletRegistrationCache } from '../../../context/WalletRegistrationContext';

type RegisterLocationState = {
  step?: number;
  pendingWallet?: string;
};

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useOpenConnectModal();
  const { markRegistered } = useWalletRegistrationCache();

  const routeState = (location.state as RegisterLocationState | null) ?? null;
  const pendingWallet = routeState?.pendingWallet?.trim() ?? '';
  const [targetWallet, setTargetWallet] = useState(
    () => routeState?.pendingWallet?.trim() ?? '',
  );

  /** State Machine: 1 = Welcome | 2 = Form | 3 = Review/Confirm | 4 = Success */
  const [step, setStep] = useState(() => {
    const s = routeState?.step;
    return s === 2 || s === 3 || s === 4 ? s : 1;
  });
  const [sponsorWallet, setSponsorWallet] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState('');
  const [registeredPathHash, setRegisteredPathHash] = useState('');

  const connectedUserWallet = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : 'Not Connected';

  const registerAddress = TITAN_CONTRACTS.Register;

  const { isRegistered: isPendingWalletRegistered, isFetched: isPendingWalletRegistrationFetched } =
    useIsWalletRegistered({
      address: pendingWallet || null,
      enabled: !!pendingWallet,
    });

  const pendingWalletHandledRef = useRef(false);

  useEffect(() => {
    if (!pendingWallet || !isPendingWalletRegistrationFetched || pendingWalletHandledRef.current) {
      return;
    }
    pendingWalletHandledRef.current = true;

    navigate(location.pathname, { replace: true, state: null });

    if (isPendingWalletRegistered) {
      setTargetWallet(pendingWallet);
      void (async () => {
        const pendingLower = pendingWallet.toLowerCase();
        const connectedLower = address?.toLowerCase();

        if (connectedLower === pendingLower) {
          navigate('/', { replace: true });
          return;
        }

        try {
          await disconnect();
        } catch (err) {
          console.warn('[Register] disconnect before wallet switch failed:', err);
        }
        openConnectModal?.();
      })();
      return;
    }

    setTargetWallet(pendingWallet);

    void (async () => {
      const pendingLower = pendingWallet.toLowerCase();
      const connectedLower = address?.toLowerCase();

      if (isConnected && connectedLower === pendingLower) {
        setStep(2);
        return;
      }

      if (isConnected) {
        try {
          await disconnect();
        } catch (err) {
          console.warn('[Register] disconnect before connect failed:', err);
        }
      }

      setStep(1);
      requestAnimationFrame(() => openConnectModal?.());
    })();
  }, [
    pendingWallet,
    isPendingWalletRegistered,
    isPendingWalletRegistrationFetched,
    navigate,
    location.pathname,
    openConnectModal,
    address,
    isConnected,
    disconnect,
  ]);

  const needsTargetWalletSwitch = Boolean(
    targetWallet &&
      (!isConnected || address?.toLowerCase() !== targetWallet.toLowerCase()),
  );

  useEffect(() => {
    if (step !== 1 || !targetWallet || !isConnected || !address) return;
    if (address.toLowerCase() === targetWallet.toLowerCase()) {
      setStep(2);
    }
  }, [step, targetWallet, isConnected, address]);

  const handleRegisterConnectWallet = () => {
    if (needsTargetWalletSwitch) {
      void (async () => {
        if (isConnected) {
          try {
            await disconnect();
          } catch (err) {
            console.warn('[Register] disconnect before connect failed:', err);
          }
        }
        openConnectModal?.();
      })();
      return;
    }

    if (isConnected) {
      setStep(2);
      return;
    }

    openConnectModal?.();
  };

  const { isRegistered: isSponsorRegistered, isLoading: loadingIsSponsor } = useIsWalletRegistered({
    address: sponsorWallet || null,
    enabled: !!sponsorWallet && step >= 3,
  });

  const { data: sponsorStatus, isLoading: loadingStatus } = useReadContract({
    address: registerAddress as `0x${string}`,
    abi: RegisterABI.abi,
    functionName: 'getUserStatus',
    args: [sponsorWallet as `0x${string}`],
    query: { enabled: !!sponsorWallet && step >= 3 },
  });

  const { data: gasPrice } = useGasPrice();
  const estimatedFee = gasPrice ? Number(formatEther(gasPrice * 2500000n)).toFixed(5) : '0.00';

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
    isError: isTxError,
    error: txReceiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxSuccess && receipt) {
      try {
        for (const log of receipt.logs) {
          try {
            const decodedLog = decodeEventLog({
              abi: RegisterABI.abi,
              data: log.data,
              topics: log.topics,
            });
            if (decodedLog.eventName === 'UserRegistered') {
              const args = decodedLog.args as { userId?: bigint; pathHash?: string };
              if (args.userId !== undefined) setRegisteredUserId(String(args.userId));
              if (args.pathHash !== undefined) setRegisteredPathHash(args.pathHash);
            }
          } catch {
            /* ignore non-matching logs */
          }
        }
      } catch (err) {
        console.error('Error parsing receipt logs', err);
      }
      if (address) markRegistered(address);
      setStep(4);
    }
  }, [isTxSuccess, receipt, address, markRegistered]);

  const isBusy = isWritePending || isTxLoading;
  const isWalletInvalid = sponsorWallet.length > 0 && !sponsorWallet.startsWith('0x');
  const canSubmitSponsorForm =
    !isWalletInvalid && sponsorWallet.length > 2 && agreed && !isBusy && step === 2;

  const handleSponsorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitSponsorForm) return;
    setStep(3);
  };

  const isSelfReferral =
    !!address &&
    !!sponsorWallet &&
    address.toLowerCase() === sponsorWallet.toLowerCase();

  const statusNum = sponsorStatus as number | undefined;

  const isSponsorBlueAllowed =
    !isSelfReferral &&
    !!isSponsorRegistered &&
    (statusNum === 0 || statusNum === 1 || statusNum === 4 || statusNum === 5);

  const isSponsorOrangeAllowed =
    !isSelfReferral && !!isSponsorRegistered && statusNum === 2;

  const isSponsorInvalid =
    isSelfReferral || !isSponsorRegistered || statusNum === 3;

  const isConfirmAllowed = isSponsorBlueAllowed || isSponsorOrangeAllowed;

  const getSponsorStatusLabel = () => {
    if (loadingIsSponsor || loadingStatus) return null;
    if (isSponsorInvalid) return { label: 'Invalid', color: 'text-red-500' };
    if (isSponsorOrangeAllowed) return { label: 'Allowed (G1)', color: 'text-orange-500' };
    if (isSponsorBlueAllowed) {
      const names: Record<number, string> = { 0: 'Free', 1: 'Active', 4: 'Royal', 5: 'Queen' };
      return { label: names[statusNum!] ?? 'Allowed', color: 'text-brand-blue' };
    }
    return { label: 'Unknown', color: 'text-gray-400' };
  };

  const sponsorStatusDisplay = getSponsorStatusLabel();
  const isTxReverted = receipt && receipt.status === 'reverted';

  const getErrorMessage = (): string => {
    if (txReceiptError) {
      const rcptMsg =
        (txReceiptError as { shortMessage?: string; message?: string })?.shortMessage ||
        (txReceiptError as { message?: string })?.message ||
        '';
      if (rcptMsg) return rcptMsg;
    }
    if (isTxReverted) return 'Transaction reverted on-chain';
    if (writeError) {
      return (
        (writeError as { shortMessage?: string })?.shortMessage ||
        writeError.message ||
        'Transaction failed'
      );
    }
    return 'Transaction failed';
  };

  const truncateMessage = (msg: string) => {
    if (!msg) return '';
    const words = msg.split(' ');
    if (words.length > 10) return words.slice(0, 10).join(' ') + '...';
    return msg;
  };

  const isFailed = !isTxSuccess && (writeError || isTxError || isTxReverted);

  const handleConfirm = () => {
    if (!isConnected || !address || !sponsorWallet || !isConfirmAllowed) return;
    writeContract({
      address: registerAddress as `0x${string}`,
      abi: RegisterABI.abi,
      functionName: 'register',
      args: [address, sponsorWallet as `0x${string}`],
      gas: 2500000n,
    });
  };

  const sponsorShort =
    sponsorWallet.length > 10
      ? `${sponsorWallet.substring(0, 6)}...${sponsorWallet.substring(sponsorWallet.length - 4)}`
      : sponsorWallet;

  const welcomeVideoRef = useRef<HTMLVideoElement>(null);

  const stepBackgroundSrc =
    step === 2
      ? registerWelcomeMedia.step2
      : step === 3
        ? registerWelcomeMedia.step3
        : step === 4
          ? registerWelcomeMedia.step4
          : null;

  useEffect(() => {
    if (step !== 1) return;
    const video = welcomeVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [step]);

  return (
    <div className="relative mx-auto h-[100dvh] w-full overflow-hidden bg-[#F6F7FA]">
      {step === 1 ? (
        <video
          ref={welcomeVideoRef}
          src={registerWelcomeMedia.video}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
      ) : (
        <img
          key={step}
          src={stepBackgroundSrc!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[60%] border-t border-gray-100 bg-white/80 backdrop-blur-3xl"
        aria-hidden
        style={{
          maskImage: REGISTER_FOG_MASK,
          WebkitMaskImage: REGISTER_FOG_MASK,
        }}
      />

      {step > 1 && !isTxSuccess && (
        <GlassButton
          variant="icon"
          type="button"
          aria-label="Back"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-50 !h-10 !w-10 !border-gray-100 !bg-white !text-gray-900"
          onClick={() => setStep(step - 1)}
        >
          <AppIcon icon="lucide:chevron-left" className="h-5 w-5 text-gray-900" />
        </GlassButton>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[72dvh] flex-col px-6 pt-10">
        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          {/* --- STEP 1: Welcome --- */}
          {step === 1 && (
            <div className="flex w-full flex-col items-center text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#27173E] sm:text-4xl">Welcome</h2>
              <p className="mt-3 max-w-[90%] text-sm font-normal leading-relaxed text-gray-500">
                Connect your wallet to start a financial birthday in the exciting and magical world
                of E.ONE
              </p>
              {targetWallet ? (
                <p className="mt-2 max-w-[90%] text-xs font-normal leading-relaxed text-gray-500">
                  Please connect{' '}
                  <span className="font-mono font-medium text-brand-pink">
                    {formatAddressForDisplay(targetWallet)}
                  </span>{' '}
                  to continue.
                </p>
              ) : null}
              <div className="mt-5 w-full">
                <GlassButton
                  variant="liquid-blue"
                  type="button"
                  className="w-full"
                  onClick={handleRegisterConnectWallet}
                >
                  {needsTargetWalletSwitch || !isConnected ? 'Connect Wallet' : 'Continue'}
                </GlassButton>
                <SafePalDappBrowserButton className="w-full" />
              </div>
            </div>
          )}

          {/* --- STEP 2: Sponsor (GlassCard on fog halo) --- */}
          {step === 2 && (
            <>
              <div className="mb-3 w-full text-center">
                <h2 className="text-xl font-bold text-[#27173E]">Sponsor Wallet</h2>
                <p className="mt-1 text-xs text-gray-500">Enter your sponsor&apos;s address</p>
              </div>
              <GlassCard glowColor="pink" className="relative z-10 w-full">
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-center sm:mb-5">
                    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-brand-blue" />
                      <span className="text-xs font-medium text-brand-surface-dark">Connected:</span>
                      <span className="font-mono text-xs font-medium text-brand-pink">
                        {connectedUserWallet}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSponsorSubmit} className="flex flex-col gap-4 sm:gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="sponsor-wallet"
                    className="ml-1 text-xs font-medium text-brand-surface-dark"
                  >
                    Sponsor Wallet
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <AppIcon icon="lucide:wallet" className="h-5 w-5 text-brand-surface-muted" />
                    </div>
                    <input
                      id="sponsor-wallet"
                      type="text"
                      value={sponsorWallet}
                      onChange={(e) => setSponsorWallet(e.target.value)}
                      placeholder="0x..."
                      className="glass-input !text-brand-surface-dark caret-brand-pink placeholder:text-brand-surface-muted/60 [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!text-brand-surface-dark [&:-webkit-autofill]:transition-all [&:-webkit-autofill]:duration-[50000s]"
                    />
                  </div>
                  {isWalletInvalid && (
                    <p className="mt-1 pl-1 text-xs font-bold text-brand-pink">
                      Wallet address must start with 0x
                    </p>
                  )}
                </div>

                <label className="group flex cursor-pointer items-center gap-3">
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        agreed
                          ? 'border-white/50 bg-brand-blue/90 shadow-[0_0_15px_rgba(78,135,255,0.7)] backdrop-blur-md'
                          : 'border-brand-blue bg-white/20'
                      }`}
                    />
                  </div>
                  <span className="select-none text-sm font-medium text-brand-surface-muted transition-colors group-hover:text-brand-surface-dark">
                    I agree to the{' '}
                    <a
                      href="#"
                      className="text-brand-blue underline decoration-transparent transition-all hover:text-brand-pink hover:decoration-brand-pink"
                    >
                      terms and conditions
                    </a>
                  </span>
                </label>

                <GlassButton
                  variant={canSubmitSponsorForm ? 'liquid-blue' : 'primary'}
                  type="submit"
                  disabled={!canSubmitSponsorForm}
                  className="mx-auto w-full py-2.5 text-sm sm:py-3"
                >
                  Continue to Review
                </GlassButton>
                  </form>
                </div>
              </GlassCard>
            </>
          )}

          {/* --- STEP 3: Review (GlassCard on fog halo) --- */}
          {step === 3 && (
            <>
              <div className="mb-3 w-full text-center">
                <h2 className="text-xl font-bold text-[#27173E]">Review</h2>
                <p className="mt-1 text-xs text-gray-500">Confirm your registration details</p>
              </div>
              <GlassCard glowColor="pink" className="relative z-10 w-full">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ul className="mb-4 flex list-none flex-col gap-2.5 sm:mb-5 sm:gap-3">
                  <li className="flex flex-row items-center justify-between border-b border-brand-pink/10 pb-2">
                    <strong className="shrink-0 text-xs font-medium text-brand-surface-dark">
                      Your wallet
                    </strong>
                    <span className="ml-4 truncate text-right text-sm font-medium text-emerald-500">
                      {connectedUserWallet}
                    </span>
                  </li>
                  <li className="flex flex-row items-center justify-between border-b border-brand-pink/10 pb-2">
                    <strong className="shrink-0 text-xs font-medium text-brand-surface-dark">
                      Sponsor wallet
                    </strong>
                    {loadingIsSponsor ? (
                      <AppIcon icon="lucide:loader-circle" className="h-4 w-4 animate-spin text-brand-pink" />
                    ) : isSelfReferral ? (
                      <span className="text-right text-sm font-medium text-red-500">
                        Self-referral
                      </span>
                    ) : isSponsorRegistered ? (
                      <span className="ml-4 truncate text-right text-sm font-medium text-brand-surface-dark">
                        {sponsorShort}
                      </span>
                    ) : (
                      <span className="text-right text-sm font-medium text-red-500">
                        Not registered
                      </span>
                    )}
                  </li>
                  <li className="flex flex-row items-center justify-between border-b border-brand-pink/10 pb-2">
                    <strong className="shrink-0 text-xs font-medium text-brand-surface-dark">
                      Status
                    </strong>
                    {loadingIsSponsor || loadingStatus ? (
                      <AppIcon icon="lucide:loader-circle" className="h-4 w-4 animate-spin text-brand-pink" />
                    ) : sponsorStatusDisplay ? (
                      <span
                        className={`text-right text-sm font-medium ${sponsorStatusDisplay.color}`}
                      >
                        {sponsorStatusDisplay.label}
                      </span>
                    ) : null}
                  </li>
                  <li className="flex flex-row items-center justify-between border-b border-brand-pink/10 pb-2">
                    <strong className="shrink-0 text-xs font-medium text-brand-surface-dark">
                      Network Fee
                    </strong>
                    <span className="text-right text-sm font-bold text-brand-surface-dark">
                      {estimatedFee} POL
                    </span>
                  </li>

                  {(isTxSuccess || isFailed || txHash) && (
                    <>
                      <li className="flex flex-row items-center justify-between border-b border-brand-pink/10 pb-2 pt-1">
                        <strong className="shrink-0 text-xs font-medium text-brand-surface-dark">
                          Transaction Status
                        </strong>
                        <span
                          className={`text-right text-sm font-bold ${isTxSuccess ? 'text-emerald-500' : isFailed ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          {isTxSuccess ? 'Success' : isFailed ? 'Failed' : 'Pending'}
                        </span>
                      </li>
                      {(isTxSuccess || isFailed) && (
                        <li className="flex flex-row items-center justify-between border-b border-brand-pink/10 pb-2 pt-1">
                          <strong className="shrink-0 text-xs font-medium text-brand-surface-dark">
                            Message
                          </strong>
                          <span
                            className={`ml-4 text-right text-[10px] font-medium ${isTxSuccess ? 'text-emerald-500' : 'text-red-500'}`}
                          >
                            {isTxSuccess
                              ? 'Registration completed successfully'
                              : truncateMessage(getErrorMessage())}
                          </span>
                        </li>
                      )}
                      {txHash && (
                        <li className="flex flex-col gap-1 pt-1">
                          <strong className="text-xs font-medium text-brand-surface-dark">
                            Transaction Hash
                          </strong>
                          <a
                            href={`${CURRENT_NETWORK_INFO.explorer}/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all font-mono text-[10px] text-brand-blue hover:underline"
                          >
                            {txHash}
                          </a>
                        </li>
                      )}
                    </>
                  )}
                </ul>

                <div className="flex flex-col gap-3">
                  {!isTxSuccess && !isBusy && !writeError && (
                    <GlassButton
                      variant={
                        isConfirmAllowed && !loadingIsSponsor && !loadingStatus
                          ? 'liquid-blue'
                          : 'primary'
                      }
                      type="button"
                      className={`mx-auto w-full py-2.5 text-sm sm:py-3 ${isSponsorOrangeAllowed ? '!bg-orange-500/90' : ''}`}
                      onClick={handleConfirm}
                      disabled={
                        !isConnected || !isConfirmAllowed || !!(loadingIsSponsor || loadingStatus)
                      }
                    >
                      Confirm Transaction
                    </GlassButton>
                  )}

                  {isBusy && (
                    <GlassButton
                      variant="primary"
                      type="button"
                      disabled
                      className="mx-auto w-full gap-2 py-2.5 text-sm sm:py-3"
                    >
                      <AppIcon icon="lucide:loader-circle" className="h-5 w-5 animate-spin" />
                      Confirming on-chain...
                    </GlassButton>
                  )}

                  {isFailed && !isBusy && (
                    <GlassButton
                      variant="liquid-blue"
                      type="button"
                      className="mx-auto w-full py-2.5 text-sm sm:py-3 !bg-red-500/90 !shadow-[0_0_24px_rgba(239,68,68,0.6)]"
                      onClick={() => {
                        reset();
                        handleConfirm();
                      }}
                      disabled={!isConnected || !isConfirmAllowed}
                    >
                      Try again
                    </GlassButton>
                  )}
                </div>
              </div>
              </div>
            </GlassCard>
            </>
          )}

          {/* --- STEP 4: Success (GlassCard on fog halo) --- */}
          {step === 4 && (
          <GlassCard glowColor="pink" className="relative z-10 w-full">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-500 sm:gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 shadow-[0_0_32px_rgba(16,185,129,0.5)] backdrop-blur-md sm:h-20 sm:w-20">
                  <AppIcon icon="lucide:circle-check" className="h-8 w-8 text-emerald-500 sm:h-10 sm:w-10" />
                </div>
                <div>
                  <h2 className="mb-1.5 text-xl font-bold text-brand-surface-dark sm:mb-2 sm:text-2xl">
                    Registration Complete!
                  </h2>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-brand-surface-muted">
                    {registeredUserId ? (
                      <span className="mb-1 block font-bold text-brand-blue">
                        Your User ID is {registeredUserId}
                      </span>
                    ) : null}
                    Your account is registered on the blockchain. You are now ready to enter the
                    ecosystem.
                  </p>
                </div>

                <div className="flex w-full items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left">
                  <AppIcon icon="lucide:triangle-alert" className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                  <p className="text-xs leading-relaxed text-orange-800 sm:text-sm">
                    <strong className="text-orange-900">IMPORTANT:</strong> You have 60 days to
                    activate your account. Unactivated accounts will be removed from the matrix.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3">
                  <GlassButton
                    variant="primary"
                    type="button"
                    className="mx-auto w-full py-2.5 text-sm sm:py-3"
                    onClick={() => navigate('/', { replace: true })}
                  >
                    Go to Dashboard
                  </GlassButton>
                </div>
              </div>
            </div>
            </GlassCard>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center gap-1.5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3">
          <AppIcon icon="lucide:shield-check" className="h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4" />
          <span className="text-[10px] font-medium tracking-wide text-gray-500 sm:text-xs">
            Secured by E.ONE Smart Contracts
          </span>
        </div>
      </div>
    </div>
  );
};
