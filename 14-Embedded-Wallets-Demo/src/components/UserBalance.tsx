"use client";
import { LoadingSkeleton } from "@coinbase/cdp-react/components/LoadingSkeleton";

interface Props {
  balance?: string;
}

/**
 * A component that displays the user's balance.
 */
export default function UserBalance(props: Props) {
  const { balance } = props;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Balance</label>
      <div className="text-2xl font-bold text-gray-900">
        {balance === undefined && <LoadingSkeleton as="span" className="h-8 w-24 bg-gray-200 rounded" />}
        {balance !== undefined && (
          <span className="flex items-center gap-2">
            <span>⚡</span>
            <span>{parseFloat(balance).toFixed(6)} ETH</span>
          </span>
        )}
      </div>
      {balance !== undefined && (
        <p className="text-sm text-gray-500 mt-1">
          {parseFloat(balance) === 0 ? "Get test ETH from the faucet above" : "Ready to send transactions"}
        </p>
      )}
    </div>
  );
}
