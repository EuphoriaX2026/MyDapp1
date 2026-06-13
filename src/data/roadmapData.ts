import { roadmapBanner } from '../assets/media';

// Data type definitions for architectural consistency
export interface Contract {
  name: string;
  network: string;
  scanUrl: string;
}

export interface Phase {
  title: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  description: string;
}

export interface RoadmapData {
  header: {
    bannerUrl: string;
    title: string;
    description: string;
  };
  overview: {
    title: string;
    summary: string;
    missionAndVision: string;
    reports: string;
  };
  whitepaper: {
    title: string;
    link: string;
    description: string;
  };
  contracts: {
    title: string;
    list: Contract[];
  };
  phases: {
    title: string;
    list: Phase[];
  };
  reports: {
      title: string;
      description: string;
  }
}

// Main content for the Roadmap page based on your whitepaper
export const roadmapData: RoadmapData = {
  header: {
    bannerUrl: roadmapBanner,
    title: 'Project Overview',
    description: "This document is not just a technical paper; it is the manifesto of a self-sufficient, integrated digital economy. Our vision is to create a parallel digital world to lead this transformation."
  },
  overview: {
    title: 'Overview', // Comma added at the end of this line
    summary: "The current digital landscape, despite all its innovations, suffers from four fundamental weaknesses: the volatility crisis, unsustainable economic models, the complexity wall, and platform fragmentation. E1 is designed to solve these challenges.",
    missionAndVision: "Our vision is to create a parallel digital world where every individual has access to advanced financial tools, sustainable wealth creation opportunities, and rich social experiences.",
    reports: 'Periodic reports, technical updates, and ecosystem growth statistics will be published in this section to maintain full transparency with the community.'
  },
  whitepaper: {
    title: 'Whitepaper',
    link: '#', // TODO: Add the link to the whitepaper file here
    description: "For a deep dive into the technical architecture, tokenomics, and strategic vision of E1, please review our official whitepaper. This document outlines the complete 9-phase ecosystem roadmap to create a cyclical and sustainable economy."
  },
  contracts: {
    title: 'Contracts',
    list: [
      {
        name: 'TitanCore.sol',
        network: 'Polygon',
        scanUrl: '#' // TODO: Add the PolygonScan link here
      },
      {
        name: 'ERX Token',
        network: 'Polygon',
        scanUrl: '#' // TODO: Add the PolygonScan link here
      },
      {
        name: 'QBit Token',
        network: 'Polygon',
        scanUrl: '#' // TODO: Add the PolygonScan link here
      }
    ]
  },
  phases: {
    title: 'Phases',
    list: [
      {
        title: 'Phase 1-3: Financial Foundation',
        status: 'Completed',
        description: 'Deployment of ERX and QBit tokens, launch of the Titan platform for network-based wealth creation, and establishment of the Hawking Academy for empowerment through knowledge.'
      },
      {
        title: 'Phase 4-6: Advanced Financial Tools',
        status: 'In Progress',
        description: 'Launching the decentralized Elaris Insurance, the Matrixon income platform, and the Jupiter Lending market to create liquidity and financial leverage.'
      },
      {
        title: 'Phase 7-9: Metaverse & Experience Economy',
        status: 'Upcoming',
        description: 'Building the NeoCity virtual city, the Avalon real estate market, and Aio Financial Games to fully integrate the ecosystem into a visual and enjoyable experience.'
      }
    ]
  },
  reports: {
      title: 'Reports / Updates',
      description: 'Periodic updates, developer changelogs, and quarterly reports will be published here to maintain full transparency with our community.'
  }
};