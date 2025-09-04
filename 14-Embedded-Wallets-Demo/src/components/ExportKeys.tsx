import { useExportEvmAccount } from '@coinbase/cdp-hooks';

const { exportAccount } = useExportEvmAccount();

const handleExport = async () => {
  if (window.confirm("WARNING: You are about to reveal your private key. Do not share this with anyone!")) {
    const privateKey = await exportAccount();
    // Logic to securely display the key to the user ONCE.
  }
};