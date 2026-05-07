import { useState } from "react";
import { MainLayout } from "../../layout/MainLayout";
import InquiryList from "../../components/inquiry/InquiryList";

export default function Inquiry() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Inquiry Management</h1>
                    <p className="text-slate-600 mt-2">View and manage customer inquiries</p>
                </div>

                {/* Direct Inquiry List - No tabs */}
                <div>
                    <InquiryList />
                </div>
            </div>
        </MainLayout>
    );
}