import React, { useState } from 'react';
import { StaffMember } from '../types';
import { MailIcon } from './icons/MailIcon';

const MOCK_STAFF: StaffMember[] = [
    { id: 'staff_1', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Owner', alertsEnabled: true },
    { id: 'staff_2', name: 'John Smith', email: 'john.smith@example.com', role: 'Manager', alertsEnabled: true },
    { id: 'staff_3', name: 'Emily White', email: 'emily.white@example.com', role: 'Staff', alertsEnabled: false },
];


const AlertsSettings: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);

    const handleToggle = (id: string) => {
        setStaff(prevStaff => 
            prevStaff.map(member => 
                member.id === id ? { ...member, alertsEnabled: !member.alertsEnabled } : member
            )
        );
    };

    return (
        <div className="bg-white rounded-lg p-6 sticky top-24 shadow-sm border border-[#e1e3e5]">
            <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center mb-4">
                <MailIcon className="w-6 h-6 mr-3 text-[#008060]" />
                Alerts & Notifications
            </h2>
            <p className="text-sm text-gray-600 mb-6">
                Choose which team members should receive low-stock email alerts.
            </p>
            <ul className="space-y-4">
                {staff.map(member => (
                    <li key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <img 
                                src={`https://i.pravatar.cc/150?u=${member.email}`} 
                                alt={member.name} 
                                className="w-10 h-10 rounded-full mr-4"
                            />
                            <div>
                                <p className="font-medium text-[#1a1a1a]">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={member.alertsEnabled} 
                                onChange={() => handleToggle(member.id)}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008060]"></div>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlertsSettings;