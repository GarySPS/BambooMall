// src/data/vipTiers.js

const vipTiers = [
  { 
    id: "MEMBER", 
    name: "Standard Associate", 
    min: 0, 
    discount: 0, 
    desc: "Restricted access to public liquidation manifests. Standard settlement queues." 
  },
  { 
    id: "VIP0", 
    name: "Verified Partner", 
    min: 5000, 
    discount: 1, 
    desc: "Unlocked wholesale pricing tier. Eligible for standard batch allocations." 
  },
  { 
    id: "VIP1", 
    name: "Silver Syndicate", 
    min: 10000, 
    discount: 2, 
    desc: "Priority access to 'Grade A' electronics. Reduced logistics fees." 
  },
  { 
    id: "VIP2", 
    name: "Gold Distributor", 
    min: 15000, 
    discount: 3, 
    desc: "T+0 Settlement eligibility. Dedicated account manager assigned." 
  },
  { 
    id: "VIPX", 
    name: "Platinum Executive", 
    min: 20000, 
    discount: 5, 
    desc: "Direct factory negotiation rights. Zero-tariff withdrawal channels." 
  },
  { 
    id: "VIVIP", 
    name: "Global Director", 
    min: 40000, 
    discount: 8, 
    desc: "Board-level access. Equity pool participation. Unlimited capital deployment." 
  }
];

export default vipTiers;