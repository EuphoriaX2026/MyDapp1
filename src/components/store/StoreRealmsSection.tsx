import React from 'react';
import { STORE_REALM_PRODUCTS } from '../../data/storeRealmProducts';
import { StoreRealmProductCard } from './StoreRealmProductCard';

interface StoreRealmsSectionProps {
  onAddRealm: (product: (typeof STORE_REALM_PRODUCTS)[number]) => void;
}

export function StoreRealmsSection({ onAddRealm }: StoreRealmsSectionProps) {
  return (
    <div className="mb-12">
      <div className="flex flex-col items-center text-center mb-8 px-2">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">The 7 Realms</h2>
        <p className="text-sm font-medium text-gray-500 max-w-md">
          Build your own empire. Mint realm nodes and evolve your network avatar.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 justify-items-center w-full">
        {STORE_REALM_PRODUCTS.map((product) => (
          <StoreRealmProductCard key={product.id} product={product} onAdd={onAddRealm} />
        ))}
      </div>
    </div>
  );
}
