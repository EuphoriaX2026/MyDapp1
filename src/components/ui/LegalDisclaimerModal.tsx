export interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function LegalDisclaimerModal({ isOpen, onAccept, onDecline }: LegalDisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F9FE]/40 backdrop-blur-md px-4">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_16px_40px_rgba(78,135,255,0.1)] p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-disclaimer-title"
      >
        <h2 id="legal-disclaimer-title" className="text-xl font-bold text-gray-900 mb-4">
          Disclaimer
        </h2>

        <div className="text-sm leading-relaxed text-gray-700 space-y-4">
          <p>
            This website contains information about cryptocurrencies and digital assets for
            informational purposes only. It does not constitute financial, investment, legal, or
            any other form of professional advice.
          </p>
          <p>
            Cryptocurrencies may be restricted or prohibited in your jurisdiction. By continuing
            to use this website, you confirm that:
          </p>
          <ul className="list-none space-y-2 pl-0">
            <li className="flex gap-2">
              <span className="text-gray-900 shrink-0" aria-hidden>
                •
              </span>
              <span>You are of legal age and have full legal capacity;</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-900 shrink-0" aria-hidden>
                •
              </span>
              <span>
                You are solely responsible for complying with all applicable laws and regulations
                in your country;
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-900 shrink-0" aria-hidden>
                •
              </span>
              <span>
                The website owner bears no responsibility for any losses incurred as a result of
                using or interpreting the information provided.
              </span>
            </li>
          </ul>
          <p>
            By clicking &ldquo;Continue,&rdquo; you agree to these terms and acknowledge your
            understanding of the above.
          </p>
        </div>

        <hr className="my-6 border-white/50" />

        <div className="flex flex-col-reverse gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="px-6 py-2.5 rounded-full bg-white/50 text-gray-700 font-medium hover:bg-white/80 border border-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4E87FF] to-[#DB2CF5] text-white font-bold shadow-md hover:shadow-lg transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalDisclaimerModal;
