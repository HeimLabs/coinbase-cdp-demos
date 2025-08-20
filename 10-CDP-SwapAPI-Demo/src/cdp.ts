import 'dotenv/config';
import { Coinbase, Wallet, Address } from '@coinbase/coinbase-sdk';

async function demonstrateAddressReputation() {
    try {
        console.log('🚀 CDP SDK Address Reputation Demo\n');

        // Configure CDP with API credentials
        Coinbase.configure({
            apiKeyName: process.env.CDP_API_KEY_ID!,
            privateKey: process.env.CDP_API_KEY_SECRET!,
        });

        console.log('✅ CDP SDK configured successfully\n');

        // Create a new wallet with an address
        console.log('📝 Creating wallet...');
        const wallet = await Wallet.create();
        console.log(`✅ Wallet created with ID: ${wallet.getId()}\n`);

        // Get the default address from the wallet
        const address = await wallet.getDefaultAddress();
        console.log(`📍 Default address: ${address.getId()}\n`);

        // Get reputation for the wallet's address
        console.log('🔍 Getting reputation for wallet address...');
        try {
            const addressReputation = await address.reputation();
            console.log('✅ Address reputation retrieved:');
            console.log(`   Score: ${addressReputation.score} (range: -100 to 100)`);
            console.log(`   Risky: ${addressReputation.risky}`);
            console.log(`   Metadata:`, addressReputation.metadata);
            console.log(`   Full details: ${addressReputation.toString()}\n`);
        } catch (error) {
            console.log('ℹ️  Address reputation not available for new address (this is normal)');
            console.log(`   Error: ${error}\n`);
        }

        // Demonstrate getting reputation for external addresses
        console.log('🔍 Getting reputation for external addresses...\n');

        // Example addresses to check reputation (known addresses with activity)
        const externalAddresses = [
            '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // Vitalik's address
            '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', // Example address
            '0xa0b86a33e6c17b10c4a3c8b5e19b1f04b7b9b1b4', // Random address
        ];

        for (const addressId of externalAddresses) {
            try {
                console.log(`🔍 Checking reputation for: ${addressId}`);
                
                // Create an Address object for the external address
                const externalAddress = new Address('base-mainnet', addressId);
                
                // Get reputation
                const reputation = await externalAddress.reputation();
                
                console.log(`✅ Reputation found:`);
                console.log(`   Score: ${reputation.score}`);
                console.log(`   Risky: ${reputation.risky}`);
                console.log(`   Metadata:`, reputation.metadata);
                console.log('');
                
            } catch (error) {
                console.log(`❌ Could not get reputation for ${addressId}`);
                console.log(`   Error: ${error}\n`);
            }
        }

        // Demonstrate direct API usage (alternative approach)
        console.log('🔧 Demonstrating direct API usage...\n');
        try {
            // Using the direct API client approach
            const apiResponse = await Coinbase.apiClients.addressReputation!.getAddressReputation(
                'base-mainnet',
                '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' // Vitalik's address
            );
            
            console.log('✅ Direct API response:');
            console.log(`   Score: ${apiResponse.data.score}`);
            console.log(`   Metadata:`, apiResponse.data.metadata);
            console.log('');
            
        } catch (error) {
            console.log('❌ Direct API call failed');
            console.log(`   Error: ${error}\n`);
        }

        // Show how to interpret reputation scores
        console.log('📊 How to interpret reputation scores:');
        console.log('   Score > 0: Good reputation (positive signals)');
        console.log('   Score = 0: Neutral reputation');
        console.log('   Score < 0: Bad reputation (negative signals)');
        console.log('   Range: -100 to +100');
        console.log('   Risky: true/false flag for high-risk addresses\n');

        console.log('✅ Address reputation demonstration completed!');

    } catch (error) {
        console.error('❌ Error in address reputation demo:', error);
        throw error;
    }
}

// Helper function to check reputation for a specific address
export async function checkAddressReputation(networkId: string, addressId: string) {
    try {
        console.log(`🔍 Checking reputation for address: ${addressId} on network: ${networkId}`);
        
        const address = new Address(networkId, addressId);
        const reputation = await address.reputation();
        
        const reputationInfo = {
            address: addressId,
            network: networkId,
            score: reputation.score,
            risky: reputation.risky,
            metadata: reputation.metadata,
            interpretation: reputation.score > 0 ? 'Good' : reputation.score < 0 ? 'Bad' : 'Neutral'
        };
        
        console.log('✅ Reputation check result:', reputationInfo);
        return reputationInfo;
        
    } catch (error) {
        console.error(`❌ Failed to get reputation for ${addressId}:`, error);
        throw error;
    }
}

// Helper function to check if an address is risky
export async function isAddressRisky(networkId: string, addressId: string): Promise<boolean> {
    try {
        const address = new Address(networkId, addressId);
        const reputation = await address.reputation();
        return reputation.risky;
    } catch (error) {
        console.warn(`Could not determine if address ${addressId} is risky:`, error);
        return false; // Default to not risky if we can't determine
    }
}

// Helper function to get reputation score
export async function getAddressScore(networkId: string, addressId: string): Promise<number | null> {
    try {
        const address = new Address(networkId, addressId);
        const reputation = await address.reputation();
        return reputation.score;
    } catch (error) {
        console.warn(`Could not get reputation score for address ${addressId}:`, error);
        return null;
    }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
    demonstrateAddressReputation()
        .catch(error => {
            console.error('Failed to run address reputation demo:', error);
            process.exit(1);
        });
}
