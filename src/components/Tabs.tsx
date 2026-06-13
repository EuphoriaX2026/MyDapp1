// src/components/Tabs.tsx

import React, { useState, Children, ReactElement, isValidElement } from 'react';

// Child component representing each tab
interface TabProps {
  title: string;
  children: React.ReactNode;
}
export const Tab: React.FC<TabProps> = ({ children }) => <>{children}</>;


// Parent component managing tabs logic
interface TabsProps {
  children: ReactElement<TabProps> | ReactElement<TabProps>[];
}
export const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  // Filtering valid children to prevent errors
  const tabs = Children.toArray(children).filter(isValidElement);

  return (
    <div className="custom-tabs-container">
      {/* Tabs header, changing active tab on click */}
      <ul className="nav nav-tabs capsuled" role="tablist">
        {tabs.map((child, index) => (
          <li className="nav-item" key={index}>
            <a
              className={`nav-link ${index === activeTab ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(index);
              }}
              href="#"
              role="tab"
            >
              {(child as any).props.title}
            </a>
          </li>
        ))}
      </ul>
      
      {/* Content of the active tab is displayed */}
      <div className="tab-content mt-2">
        {tabs[activeTab]}
      </div>
    </div>
  );
};