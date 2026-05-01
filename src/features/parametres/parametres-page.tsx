"use client";

import React from "react";
import { Profile } from "@/models/system.model";

export const ParametresPage: React.FC<{ currentUser: Profile }> = ({ currentUser }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Paramètres pour {currentUser.nom}</h2>
    </div>
  );
};
