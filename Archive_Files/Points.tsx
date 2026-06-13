import { useEffect } from 'react';
import { PointsMatrixCard } from '../components/profile/PointsMatrixCard';
import { IonIcon } from '@ionic/react';
import { helpCircleOutline } from 'ionicons/icons';

export default function Points() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ backgroundColor: '#0d0714', minHeight: '100vh', marginTop: '-10px', paddingBottom: '80px' }}>
            {/* Page Header */}
            <div className="pt-4 px-4 pb-2 border-b border-gray-800">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="text-white fw-bold mb-1" style={{ fontSize: '24px' }}>Points Hub</h2>
                        <p className="mb-0" style={{ color: '#a098b0', fontSize: '13px' }}>Monitor your team building and balances.</p>
                    </div>
                </div>
            </div>

            {/* Matrix Card Container */}
            <div className="px-3 mt-4">
                <PointsMatrixCard />
            </div>
        </div>
    );
}
