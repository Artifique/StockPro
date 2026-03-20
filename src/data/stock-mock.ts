/** Profils démo (sans secret — l’auth réelle est côté serveur). */
export const MOCK_USERS = [
  { id: 1, email: "admin@stockpro.com", role: "Super Admin", nom: "Karim Benali", avatar: "KB", color: "#6366f1", statut: "actif" },
  { id: 2, email: "gerant@stockpro.com", role: "Gérant", nom: "Amina Toure", avatar: "AT", color: "#10b981", statut: "actif" },
  { id: 3, email: "caissier@stockpro.com", role: "Caissier", nom: "Youssef Diallo", avatar: "YD", color: "#f59e0b", statut: "actif" },
  { id: 4, email: "stock@stockpro.com", role: "Responsable Stock", nom: "Fatima Ndiaye", avatar: "FN", color: "#ec4899", statut: "actif" },
  { id: 5, email: "compta@stockpro.com", role: "Comptable", nom: "Omar Traoré", avatar: "OT", color: "#14b8a6", statut: "actif" },
];

export const CATEGORIES = [
  { id: 1, nom: "Alimentaire", color: "#22c55e" },
  { id: 2, nom: "Vêtements", color: "#3b82f6" },
  { id: 3, nom: "Électronique", color: "#8b5cf6" },
  { id: 4, nom: "Cosmétiques", color: "#ec4899" },
  { id: 5, nom: "Ménager", color: "#f59e0b" },
  { id: 6, nom: "Bureautique", color: "#6366f1" },
];

// Unités de mesure disponibles
export const UNITES_MESURE = [
  { id: 1, nom: "pièce", abreviation: "pc" },
  { id: 2, nom: "sac", abreviation: "sac" },
  { id: 3, nom: "bouteille", abreviation: "bt" },
  { id: 4, nom: "paquet", abreviation: "pqt" },
  { id: 5, nom: "boîte", abreviation: "bx" },
  { id: 6, nom: "lot", abreviation: "lot" },
  { id: 7, nom: "kg", abreviation: "kg" },
  { id: 8, nom: "g", abreviation: "g" },
  { id: 9, nom: "L", abreviation: "L" },
  { id: 10, nom: "m", abreviation: "m" },
  { id: 11, nom: "flacon", abreviation: "fl" },
  { id: 12, nom: "tube", abreviation: "tb" },
  { id: 13, nom: "carton", abreviation: "ct" },
];

export const MOCK_PRODUCTS = [
  { id: 1, nom: "Riz Premium 5kg", sku: "ALI-001", categorie: "Alimentaire", prixAchat: 3500, prixVente: 4500, stock: 156, stockMin: 20, unite: "sac", description: "Riz de haute qualité", tva: 18, image: null },
  { id: 2, nom: "Huile Végétale 1L", sku: "ALI-002", categorie: "Alimentaire", prixAchat: 1200, prixVente: 1600, stock: 89, stockMin: 30, unite: "bouteille", description: "Huile 100% végétale", tva: 18, image: null },
  { id: 3, nom: "Sucre Blanc 1kg", sku: "ALI-003", categorie: "Alimentaire", prixAchat: 800, prixVente: 1100, stock: 234, stockMin: 50, unite: "paquet", description: "Sucre raffiné", tva: 18, image: null },
  { id: 4, nom: "Thé Vert 250g", sku: "ALI-004", categorie: "Alimentaire", prixAchat: 1500, prixVente: 2200, stock: 5, stockMin: 15, unite: "boîte", description: "Thé vert premium", tva: 18, image: null },
  { id: 5, nom: "Café Torréfié 500g", sku: "ALI-005", categorie: "Alimentaire", prixAchat: 2800, prixVente: 3800, stock: 0, stockMin: 10, unite: "paquet", description: "Café arabica", tva: 18, image: null },
  { id: 6, nom: "Chemise Homme", sku: "VET-001", categorie: "Vêtements", prixAchat: 8000, prixVente: 12500, stock: 45, stockMin: 10, unite: "pièce", description: "Chemise coton", tva: 18, image: null },
  { id: 7, nom: "Robe Femme", sku: "VET-002", categorie: "Vêtements", prixAchat: 15000, prixVente: 25000, stock: 32, stockMin: 8, unite: "pièce", description: "Robe élégante", tva: 18, image: null },
  { id: 8, nom: "Jean Slim", sku: "VET-003", categorie: "Vêtements", prixAchat: 12000, prixVente: 18000, stock: 8, stockMin: 15, unite: "pièce", description: "Jean stretch", tva: 18, image: null },
  { id: 9, nom: "Smartphone Android", sku: "ELE-001", categorie: "Électronique", prixAchat: 85000, prixVente: 110000, stock: 12, stockMin: 5, unite: "pièce", description: "Smartphone 4G", tva: 18, image: null },
  { id: 10, nom: "Écouteurs Bluetooth", sku: "ELE-002", categorie: "Électronique", prixAchat: 8000, prixVente: 12000, stock: 67, stockMin: 10, unite: "pièce", description: "Écouteurs sans fil", tva: 18, image: null },
  { id: 11, nom: "Chargeur Universel", sku: "ELE-003", categorie: "Électronique", prixAchat: 2500, prixVente: 4000, stock: 0, stockMin: 20, unite: "pièce", description: "Chargeur rapide", tva: 18, image: null },
  { id: 12, nom: "Power Bank 10000mAh", sku: "ELE-004", categorie: "Électronique", prixAchat: 15000, prixVente: 22000, stock: 23, stockMin: 8, unite: "pièce", description: "Batterie externe", tva: 18, image: null },
  { id: 13, nom: "Crème Hydratante", sku: "COS-001", categorie: "Cosmétiques", prixAchat: 3500, prixVente: 5500, stock: 78, stockMin: 15, unite: "tube", description: "Crème visage", tva: 18, image: null },
  { id: 14, nom: "Parfum Homme 100ml", sku: "COS-002", categorie: "Cosmétiques", prixAchat: 18000, prixVente: 28000, stock: 15, stockMin: 5, unite: "flacon", description: "Eau de toilette", tva: 18, image: null },
  { id: 15, nom: "Savon Liquide 500ml", sku: "MEN-001", categorie: "Ménager", prixAchat: 1500, prixVente: 2500, stock: 3, stockMin: 25, unite: "bouteille", description: "Savon mains", tva: 18, image: null },
  { id: 16, nom: "Cahier 200 pages", sku: "BUR-001", categorie: "Bureautique", prixAchat: 500, prixVente: 850, stock: 145, stockMin: 30, unite: "pièce", description: "Cahier quadrillé", tva: 18, image: null },
  { id: 17, nom: "Stylo Bic (lot 10)", sku: "BUR-002", categorie: "Bureautique", prixAchat: 800, prixVente: 1400, stock: 67, stockMin: 20, unite: "lot", description: "Stylos bleus", tva: 18, image: null },
  { id: 18, nom: "Dossier Cartonné", sku: "BUR-003", categorie: "Bureautique", prixAchat: 300, prixVente: 600, stock: 234, stockMin: 50, unite: "pièce", description: "Dossier A4", tva: 18, image: null },
];

export const MOCK_CLIENTS = [
  { id: 1, nom: "Amadou Koné", telephone: "+223 70 12 34 56", email: "amadou.kone@email.com", type: "VIP", caTotal: 2450000, solde: -125000, statut: "actif", dateCreation: "2024-01-15" },
  { id: 2, nom: "Fatoumata Coulibaly", telephone: "+223 71 23 45 67", email: "fatoumata.c@email.com", type: "Grossiste", caTotal: 5890000, solde: 450000, statut: "actif", dateCreation: "2024-02-20" },
  { id: 3, nom: "Boubacar Touré", telephone: "+223 72 34 56 78", email: "boubacar.t@email.com", type: "Détaillant", caTotal: 890000, solde: 0, statut: "actif", dateCreation: "2024-03-10" },
  { id: 4, nom: "Aissata Traoré", telephone: "+223 73 45 67 89", email: "aissata.t@email.com", type: "Particulier", caTotal: 345000, solde: -45000, statut: "actif", dateCreation: "2024-04-05" },
  { id: 5, nom: "Mamadou Diallo", telephone: "+223 74 56 78 90", email: "mamadou.d@email.com", type: "VIP", caTotal: 3780000, solde: 125000, statut: "actif", dateCreation: "2024-01-28" },
  { id: 6, nom: "Kadiatou Sylla", telephone: "+223 75 67 89 01", email: "kadiatou.s@email.com", type: "Grossiste", caTotal: 4560000, solde: -230000, statut: "actif", dateCreation: "2024-02-14" },
  { id: 7, nom: "Ibrahim Keita", telephone: "+223 76 78 90 12", email: "ibrahim.k@email.com", type: "Détaillant", caTotal: 1230000, solde: 0, statut: "inactif", dateCreation: "2024-03-22" },
  { id: 8, nom: "Mariam Cissé", telephone: "+223 77 89 01 23", email: "mariam.c@email.com", type: "Particulier", caTotal: 567000, solde: -78000, statut: "actif", dateCreation: "2024-05-01" },
  { id: 9, nom: "Seydou Konaté", telephone: "+223 78 90 12 34", email: "seydou.k@email.com", type: "VIP", caTotal: 5120000, solde: 340000, statut: "actif", dateCreation: "2024-01-05" },
  { id: 10, nom: "Oumou Sangaré", telephone: "+223 79 01 23 45", email: "oumou.s@email.com", type: "Grossiste", caTotal: 6780000, solde: -180000, statut: "actif", dateCreation: "2024-02-28" },
];

export const MOCK_TRANSACTIONS = [
  { id: "TRX-001", produit: "Riz Premium 5kg", client: "Amadou Koné", montant: 45000, modePaiement: "Espèces", statut: "Payé", date: "2024-12-15 09:23" },
  { id: "TRX-002", produit: "Smartphone Android", client: "Fatoumata Coulibaly", montant: 110000, modePaiement: "Carte", statut: "Payé", date: "2024-12-15 10:45" },
  { id: "TRX-003", produit: "Chemise Homme", client: "Boubacar Touré", montant: 25000, modePaiement: "Mobile Money", statut: "En attente", date: "2024-12-15 11:12" },
  { id: "TRX-004", produit: "Crème Hydratante", client: "Aissata Traoré", montant: 16500, modePaiement: "Espèces", statut: "Payé", date: "2024-12-15 12:30" },
  { id: "TRX-005", produit: "Écouteurs Bluetooth", client: "Mamadou Diallo", montant: 36000, modePaiement: "Carte", statut: "Annulé", date: "2024-12-15 14:15" },
  { id: "TRX-006", produit: "Café Torréfié 500g", client: "Kadiatou Sylla", montant: 19000, modePaiement: "Mobile Money", statut: "Payé", date: "2024-12-15 15:00" },
  { id: "TRX-007", produit: "Jean Slim", client: "Ibrahim Keita", montant: 54000, modePaiement: "Espèces", statut: "En attente", date: "2024-12-15 15:45" },
  { id: "TRX-008", produit: "Power Bank 10000mAh", client: "Mariam Cissé", montant: 44000, modePaiement: "Carte", statut: "Payé", date: "2024-12-15 16:20" },
  { id: "TRX-009", produit: "Parfum Homme 100ml", client: "Seydou Konaté", montant: 56000, modePaiement: "Mobile Money", statut: "Payé", date: "2024-12-15 17:05" },
  { id: "TRX-010", produit: "Thé Vert 250g", client: "Oumou Sangaré", montant: 11000, modePaiement: "Espèces", statut: "Payé", date: "2024-12-15 17:50" },
];

export const VENTES_MENSUELLES = [
  { mois: "Jan", ventes: 6450000, achats: 4200000 },
  { mois: "Fév", ventes: 7120000, achats: 4800000 },
  { mois: "Mar", ventes: 5890000, achats: 3500000 },
  { mois: "Avr", ventes: 8340000, achats: 5200000 },
  { mois: "Mai", ventes: 7680000, achats: 4900000 },
  { mois: "Juin", ventes: 9120000, achats: 5800000 },
  { mois: "Juil", ventes: 8560000, achats: 5500000 },
  { mois: "Aoû", ventes: 7890000, achats: 5100000 },
  { mois: "Sep", ventes: 9450000, achats: 6200000 },
  { mois: "Oct", ventes: 10230000, achats: 6800000 },
  { mois: "Nov", ventes: 11560000, achats: 7500000 },
  { mois: "Déc", ventes: 12840000, achats: 8200000 },
];

export const TOP_PRODUITS = [
  { nom: "Riz Premium 5kg", quantite: 456, ca: 2052000 },
  { nom: "Smartphone Android", quantite: 89, ca: 9790000 },
  { nom: "Huile Végétale 1L", quantite: 378, ca: 604800 },
  { nom: "Chemise Homme", quantite: 234, ca: 2925000 },
  { nom: "Écouteurs Bluetooth", quantite: 189, ca: 2268000 },
  { nom: "Crème Hydratante", quantite: 312, ca: 1716000 },
  { nom: "Power Bank 10000mAh", quantite: 145, ca: 3190000 },
  { nom: "Café Torréfié 500g", quantite: 267, ca: 1014600 },
];

export const REPARTITION_CA = [
  { categorie: "Alimentaire", valeur: 38, color: "#22c55e" },
  { categorie: "Vêtements", valeur: 25, color: "#3b82f6" },
  { categorie: "Électronique", valeur: 22, color: "#8b5cf6" },
  { categorie: "Autres", valeur: 15, color: "#f59e0b" },
];

export const STOCK_EVOLUTION = [
  { jour: "1", stock: 2450 },
  { jour: "5", stock: 2380 },
  { jour: "10", stock: 2520 },
  { jour: "15", stock: 2410 },
  { jour: "20", stock: 2680 },
  { jour: "25", stock: 2590 },
  { jour: "30", stock: 2470 },
];

export const ACTIVITES_RECENTES = [
  { id: 1, action: "Vente effectuée", utilisateur: "Youssef Diallo", heure: "17:50", icone: "shopping" },
  { id: 2, action: "Stock mis à jour - Thé Vert", utilisateur: "Fatima Ndiaye", heure: "17:35", icone: "stock" },
  { id: 3, action: "Nouveau client ajouté", utilisateur: "Amina Toure", heure: "16:45", icone: "user" },
  { id: 4, action: "Commande fournisseur reçue", utilisateur: "Fatima Ndiaye", heure: "15:30", icone: "truck" },
  { id: 5, action: "Prix modifié - Smartphone", utilisateur: "Karim Benali", heure: "14:20", icone: "edit" },
  { id: 6, action: "Rapport généré", utilisateur: "Omar Traoré", heure: "12:00", icone: "chart" },
  { id: 7, action: "Client VIP identifié", utilisateur: "Amina Toure", heure: "11:15", icone: "star" },
  { id: 8, action: "Alerte stock critique", utilisateur: "Système", heure: "10:30", icone: "alert" },
];

// Fournisseurs mock data
export const MOCK_FOURNISSEURS = [
  { id: 1, nom: "Africa Food Distribution", contact: "Ibrahim Koné", telephone: "+223 70 11 22 33", email: "contact@africafood.ml", adresse: "Bamako, Hamdallaye", categorie: "Alimentaire", commandeTotal: 12500000, statut: "actif" },
  { id: 2, nom: "Tech Mali SARL", contact: "Fatoumata Diallo", telephone: "+223 71 22 33 44", email: "ventes@techmali.ml", adresse: "Bamako, ACI 2000", categorie: "Électronique", commandeTotal: 8900000, statut: "actif" },
  { id: 3, nom: "Fashion West Africa", contact: "Amadou Traoré", telephone: "+223 72 33 44 55", email: "orders@fashionwa.com", adresse: "Bamako, Kalaban Coura", categorie: "Vêtements", commandeTotal: 6700000, statut: "actif" },
  { id: 4, nom: "Beauty Plus", contact: "Aissata Coulibaly", telephone: "+223 73 44 55 66", email: "info@beautyplus.ml", adresse: "Bamako, Badalabougou", categorie: "Cosmétiques", commandeTotal: 4500000, statut: "actif" },
  { id: 5, nom: "Ménager Express", contact: "Seydou Keita", telephone: "+223 74 55 66 77", email: "contact@menagerexpress.ml", adresse: "Bamako, Sébénikoro", categorie: "Ménager", commandeTotal: 3200000, statut: "inactif" },
  { id: 6, nom: "Bureau Pro", contact: "Mariam Sangaré", telephone: "+223 75 66 77 88", email: "sales@bureaupro.ml", adresse: "Bamako, Niamakoro", categorie: "Bureautique", commandeTotal: 2100000, statut: "actif" },
];

// Commandes fournisseurs mock data
export const MOCK_COMMANDES = [
  { id: "CMD-001", fournisseur: "Africa Food Distribution", date: "2024-12-14", montant: 2450000, statut: "Reçue", produits: 15 },
  { id: "CMD-002", fournisseur: "Tech Mali SARL", date: "2024-12-13", montant: 3800000, statut: "En transit", produits: 8 },
  { id: "CMD-003", fournisseur: "Fashion West Africa", date: "2024-12-12", montant: 1200000, statut: "En attente", produits: 25 },
  { id: "CMD-004", fournisseur: "Beauty Plus", date: "2024-12-10", montant: 890000, statut: "Reçue", produits: 12 },
  { id: "CMD-005", fournisseur: "Africa Food Distribution", date: "2024-12-08", montant: 1560000, statut: "Reçue", produits: 20 },
  { id: "CMD-006", fournisseur: "Bureau Pro", date: "2024-12-05", montant: 450000, statut: "Annulée", produits: 5 },
];

// Factures mock data
export const MOCK_FACTURES = [
  { id: "FAC-2024-001", client: "Amadou Koné", date: "2024-12-15", montant: 245000, statut: "Payée", echeance: "2024-12-15" },
  { id: "FAC-2024-002", client: "Fatoumata Coulibaly", date: "2024-12-14", montant: 890000, statut: "Payée", echeance: "2024-12-14" },
  { id: "FAC-2024-003", client: "Boubacar Touré", date: "2024-12-13", montant: 125000, statut: "En attente", echeance: "2024-12-20" },
  { id: "FAC-2024-004", client: "Kadiatou Sylla", date: "2024-12-12", montant: 567000, statut: "En attente", echeance: "2024-12-19" },
  { id: "FAC-2024-005", client: "Seydou Konaté", date: "2024-12-11", montant: 1230000, statut: "En retard", echeance: "2024-12-11" },
  { id: "FAC-2024-006", client: "Oumou Sangaré", date: "2024-12-10", montant: 345000, statut: "Payée", echeance: "2024-12-10" },
  { id: "FAC-2024-007", client: "Mamadou Diallo", date: "2024-12-09", montant: 789000, statut: "Payée", echeance: "2024-12-09" },
  { id: "FAC-2024-008", client: "Mariam Cissé", date: "2024-12-08", montant: 156000, statut: "Annulée", echeance: "2024-12-15" },
];

// Mouvements de stock mock data
export const MOCK_MOUVEMENTS = [
  { id: 1, produit: "Riz Premium 5kg", type: "Entrée", quantite: 50, date: "2024-12-15 09:00", utilisateur: "Fatima Ndiaye", motif: "Réception CMD-001" },
  { id: 2, produit: "Huile Végétale 1L", type: "Sortie", quantite: 12, date: "2024-12-15 10:30", utilisateur: "Youssef Diallo", motif: "Vente TRX-001" },
  { id: 3, produit: "Smartphone Android", type: "Sortie", quantite: 1, date: "2024-12-15 11:45", utilisateur: "Youssef Diallo", motif: "Vente TRX-002" },
  { id: 4, produit: "Thé Vert 250g", type: "Entrée", quantite: 30, date: "2024-12-14 14:00", utilisateur: "Fatima Ndiaye", motif: "Réapprovisionnement" },
  { id: 5, produit: "Chargeur Universel", type: "Entrée", quantite: 100, date: "2024-12-14 16:30", utilisateur: "Fatima Ndiaye", motif: "Réception CMD-001" },
  { id: 6, produit: "Chemise Homme", type: "Sortie", quantite: 3, date: "2024-12-13 09:15", utilisateur: "Youssef Diallo", motif: "Vente TRX-003" },
  { id: 7, produit: "Café Torréfié 500g", type: "Sortie", quantite: 5, date: "2024-12-13 11:00", utilisateur: "Youssef Diallo", motif: "Vente TRX-006" },
  { id: 8, produit: "Jean Slim", type: "Ajustement", quantite: -2, date: "2024-12-12 15:00", utilisateur: "Fatima Ndiaye", motif: "Inventaire" },
];

// Retours et échanges - Types et motifs
export const MOTIFS_RETOUR = [
  { id: "defectueux", label: "Produit défectueux", description: "Le produit présente un défaut de fabrication" },
  { id: "mauvaise_qualite", label: "Mauvaise qualité", description: "La qualité ne correspond pas aux attentes" },
  { id: "erreur_commande", label: "Erreur de commande", description: "Le client a commandé le mauvais produit" },
  { id: "erreur_livraison", label: "Erreur de livraison", description: "Le produit livré ne correspond pas à la commande" },
  { id: "taille_incorrecte", label: "Taille incorrecte", description: "La taille ne convient pas" },
  { id: "non_conforme", label: "Non conforme", description: "Le produit ne correspond pas à la description" },
  { id: "change_avis", label: "Changement d'avis", description: "Le client ne souhaite plus le produit" },
  { id: "autre", label: "Autre raison", description: "Autre motif non listé" },
];

// Statuts des retours
export const STATUTS_RETOUR = {
  demande: { label: "Demande en cours", color: "amber" },
  en_attente: { label: "En attente de validation", color: "sky" },
  valide: { label: "Validé", color: "emerald" },
  rembourse: { label: "Remboursé", color: "violet" },
  echange: { label: "Échangé", color: "indigo" },
  refuse: { label: "Refusé", color: "rose" },
  annule: { label: "Annulé", color: "slate" },
};

// Historique des retours
export const MOCK_RETOURS = [
  {
    id: "RET-2024-001",
    dateDemande: "2024-12-14",
    client: "Amadou Koné",
    clientTelephone: "+223 70 12 34 56",
    produit: "Smartphone Android",
    produitSku: "ELE-001",
    quantite: 1,
    prixUnitaire: 110000,
    montantTotal: 110000,
    type: "retour", // retour ou echange
    motif: "defectueux",
    motifDescription: "L'écran ne s'allume pas après 2 jours d'utilisation",
    statut: "valide",
    dateValidation: "2024-12-15",
    produitEchange: null,
    montantRembourse: 0,
    processedBy: "Karim Benali",
    notes: "Produit retourné dans son emballage d'origine, en bon état apparent"
  },
  {
    id: "RET-2024-002",
    dateDemande: "2024-12-13",
    client: "Fatoumata Coulibaly",
    clientTelephone: "+223 71 23 45 67",
    produit: "Chemise Homme",
    produitSku: "VET-001",
    quantite: 2,
    prixUnitaire: 12500,
    montantTotal: 25000,
    type: "echange",
    motif: "taille_incorrecte",
    motifDescription: "Taille M trop petite, souhaite taille L",
    statut: "echange",
    dateValidation: "2024-12-14",
    produitEchange: { nom: "Chemise Homme", sku: "VET-001", taille: "L", prix: 12500, quantite: 2 },
    montantRembourse: 0,
    processedBy: "Amina Toure",
    notes: "Échange effectué, différence de prix: 0 FCFA"
  },
  {
    id: "RET-2024-003",
    dateDemande: "2024-12-12",
    client: "Boubacar Touré",
    clientTelephone: "+223 72 34 56 78",
    produit: "Écouteurs Bluetooth",
    produitSku: "ELE-002",
    quantite: 1,
    prixUnitaire: 12000,
    montantTotal: 12000,
    type: "retour",
    motif: "mauvaise_qualite",
    motifDescription: "Qualité audio médiocre, grésillements",
    statut: "rembourse",
    dateValidation: "2024-12-13",
    produitEchange: null,
    montantRembourse: 12000,
    processedBy: "Karim Benali",
    notes: "Remboursement effectué par Mobile Money"
  },
  {
    id: "RET-2024-004",
    dateDemande: "2024-12-11",
    client: "Aissata Traoré",
    clientTelephone: "+223 73 45 67 89",
    produit: "Crème Hydratante",
    produitSku: "COS-001",
    quantite: 1,
    prixUnitaire: 5500,
    montantTotal: 5500,
    type: "retour",
    motif: "allergie",
    motifDescription: "Réaction allergique après application",
    statut: "refuse",
    dateValidation: "2024-12-12",
    produitEchange: null,
    montantRembourse: 0,
    processedBy: "Amina Toure",
    notes: "Produit ouvert, impossible au retour selon politique de la boutique pour cosmétiques"
  },
  {
    id: "RET-2024-005",
    dateDemande: "2024-12-10",
    client: "Mamadou Diallo",
    clientTelephone: "+223 74 56 78 90",
    produit: "Jean Slim",
    produitSku: "VET-003",
    quantite: 1,
    prixUnitaire: 18000,
    montantTotal: 18000,
    type: "echange",
    motif: "erreur_commande",
    motifDescription: "Couleur non souhaitée, préfère bleu foncé",
    statut: "echange",
    dateValidation: "2024-12-11",
    produitEchange: { nom: "Jean Slim Bleu Foncé", sku: "VET-003-BF", prix: 18500, quantite: 1 },
    montantRembourse: 0,
    processedBy: "Youssef Diallo",
    notes: "Échange avec supplément de 500 FCFA payé par le client"
  },
  {
    id: "RET-2024-006",
    dateDemande: "2024-12-09",
    client: "Kadiatou Sylla",
    clientTelephone: "+223 75 67 89 01",
    produit: "Riz Premium 5kg",
    produitSku: "ALI-001",
    quantite: 3,
    prixUnitaire: 4500,
    montantTotal: 13500,
    type: "retour",
    motif: "non_conforme",
    motifDescription: "Qualité du riz différente de celle annoncée",
    statut: "en_attente",
    dateValidation: null,
    produitEchange: null,
    montantRembourse: 0,
    processedBy: null,
    notes: "En attente de vérification par le responsable stock"
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 SYSTÈME DE LOGS ET TRAÇABILITÉ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Types d'actions loggées
export const LOG_TYPES = {
  // Authentification
  LOGIN: { label: "Connexion", category: "auth", icon: "🔐", severity: "info" },
  LOGOUT: { label: "Déconnexion", category: "auth", icon: "🚪", severity: "info" },
  LOGIN_FAILED: { label: "Échec de connexion", category: "auth", icon: "❌", severity: "warning" },
  PASSWORD_CHANGE: { label: "Mot de passe modifié", category: "auth", icon: "🔑", severity: "warning" },
  TWO_FA_ENABLED: { label: "2FA activée", category: "auth", icon: "🛡️", severity: "success" },

  // Produits
  PRODUCT_CREATE: { label: "Produit créé", category: "produits", icon: "➕", severity: "success" },
  PRODUCT_UPDATE: { label: "Produit modifié", category: "produits", icon: "✏️", severity: "info" },
  PRODUCT_DELETE: { label: "Produit supprimé", category: "produits", icon: "🗑️", severity: "danger" },

  // Stock
  STOCK_ENTRY: { label: "Entrée stock", category: "stock", icon: "📥", severity: "success" },
  STOCK_EXIT: { label: "Sortie stock", category: "stock", icon: "📤", severity: "warning" },
  STOCK_ADJUSTMENT: { label: "Ajustement stock", category: "stock", icon: "⚖️", severity: "info" },
  STOCK_ALERT: { label: "Alerte stock", category: "stock", icon: "⚠️", severity: "warning" },

  // Ventes
  SALE_CREATE: { label: "Vente effectuée", category: "ventes", icon: "💰", severity: "success" },
  SALE_CANCEL: { label: "Vente annulée", category: "ventes", icon: "❌", severity: "danger" },
  SALE_REFUND: { label: "Remboursement", category: "ventes", icon: "💸", severity: "warning" },

  // Clients
  CLIENT_CREATE: { label: "Client créé", category: "clients", icon: "👤", severity: "success" },
  CLIENT_UPDATE: { label: "Client modifié", category: "clients", icon: "✏️", severity: "info" },
  CLIENT_DELETE: { label: "Client supprimé", category: "clients", icon: "🗑️", severity: "danger" },

  // Factures
  INVOICE_CREATE: { label: "Facture créée", category: "facturation", icon: "📄", severity: "success" },
  INVOICE_PAY: { label: "Facture payée", category: "facturation", icon: "💳", severity: "success" },
  INVOICE_CANCEL: { label: "Facture annulée", category: "facturation", icon: "❌", severity: "danger" },
  INVOICE_SEND: { label: "Facture envoyée", category: "facturation", icon: "📧", severity: "info" },

  // Retours & Échanges
  RETURN_CREATE: { label: "Retour demandé", category: "retours", icon: "↩️", severity: "info" },
  RETURN_VALIDATE: { label: "Retour validé", category: "retours", icon: "✅", severity: "success" },
  RETURN_REFUND: { label: "Retour remboursé", category: "retours", icon: "💸", severity: "success" },
  RETURN_EXCHANGE: { label: "Produit échangé", category: "retours", icon: "🔄", severity: "success" },
  RETURN_REJECT: { label: "Retour refusé", category: "retours", icon: "❌", severity: "danger" },

  // Fournisseurs
  SUPPLIER_CREATE: { label: "Fournisseur créé", category: "fournisseurs", icon: "🏭", severity: "success" },
  SUPPLIER_UPDATE: { label: "Fournisseur modifié", category: "fournisseurs", icon: "✏️", severity: "info" },
  SUPPLIER_ORDER: { label: "Commande fournisseur", category: "fournisseurs", icon: "📦", severity: "info" },
  SUPPLIER_ORDER_RECEIVE: { label: "Commande reçue", category: "fournisseurs", icon: "✅", severity: "success" },

  // Paramètres
  SETTINGS_UPDATE: { label: "Paramètres modifiés", category: "settings", icon: "⚙️", severity: "info" },
  SETTINGS_EXPORT: { label: "Export données", category: "settings", icon: "📤", severity: "info" },
  SETTINGS_IMPORT: { label: "Import données", category: "settings", icon: "📥", severity: "info" },
  BACKUP_CREATE: { label: "Sauvegarde créée", category: "settings", icon: "💾", severity: "success" },

  // Système
  SYSTEM_START: { label: "Système démarré", category: "system", icon: "🚀", severity: "info" },
  SYSTEM_ERROR: { label: "Erreur système", category: "system", icon: "💥", severity: "danger" },
  SYSTEM_BACKUP: { label: "Sauvegarde auto", category: "system", icon: "💾", severity: "info" },
};

// Catégories de logs
export const LOG_CATEGORIES = [
  { id: "all", label: "Toutes les activités" },
  { id: "auth", label: "Authentification" },
  { id: "produits", label: "Produits" },
  { id: "stock", label: "Stock" },
  { id: "ventes", label: "Ventes" },
  { id: "clients", label: "Clients" },
  { id: "facturation", label: "Facturation" },
  { id: "retours", label: "Retours & Échanges" },
  { id: "fournisseurs", label: "Fournisseurs" },
  { id: "settings", label: "Paramètres" },
  { id: "system", label: "Système" },
];

// Niveaux de sévérité
export const SEVERITY_STYLES = {
  info: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-400", badge: "info" },
  success: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", badge: "success" },
  warning: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", badge: "warning" },
  danger: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", badge: "danger" },
};

// Données mock des logs
export const MOCK_LOGS = [
  // Aujourd'hui
  { id: 1, type: "LOGIN", timestamp: "2024-12-15 17:50:23", user: "Karim Benali", userRole: "Super Admin", details: "Connexion réussie depuis Bamako, Mali", ip: "192.168.1.100", metadata: { device: "Chrome on Windows", location: "Bamako, Mali" } },
  { id: 2, type: "SALE_CREATE", timestamp: "2024-12-15 17:45:12", user: "Youssef Diallo", userRole: "Caissier", details: "Vente TRX-010: Thé Vert 250g x1 → 11 000 FCFA", ip: "192.168.1.102", metadata: { saleId: "TRX-010", amount: 11000, client: "Oumou Sangaré", paymentMethod: "Espèces" } },
  { id: 3, type: "STOCK_EXIT", timestamp: "2024-12-15 17:45:12", user: "Youssef Diallo", userRole: "Caissier", details: "Sortie stock: Thé Vert 250g (-1)", ip: "192.168.1.102", metadata: { product: "Thé Vert 250g", quantity: -1, newStock: 4 } },
  { id: 4, type: "RETURN_CREATE", timestamp: "2024-12-15 16:30:00", user: "Amina Toure", userRole: "Gérant", details: "Demande de retour RET-2024-007 créée pour Amadou Koné", ip: "192.168.1.101", metadata: { returnId: "RET-2024-007", product: "Huile Végétale 1L", quantity: 2, reason: "Produit endommagé" } },
  { id: 5, type: "INVOICE_PAY", timestamp: "2024-12-15 15:20:45", user: "Omar Traoré", userRole: "Comptable", details: "Facture FAC-2024-001 payée: 245 000 FCFA par Amadou Koné", ip: "192.168.1.103", metadata: { invoiceId: "FAC-2024-001", amount: 245000, client: "Amadou Koné" } },
  { id: 6, type: "PRODUCT_UPDATE", timestamp: "2024-12-15 14:15:30", user: "Fatima Ndiaye", userRole: "Responsable Stock", details: "Prix de 'Smartphone Android' modifié: 105 000 → 110 000 FCFA", ip: "192.168.1.104", metadata: { productId: 9, product: "Smartphone Android", oldPrice: 105000, newPrice: 110000 } },
  { id: 7, type: "STOCK_ENTRY", timestamp: "2024-12-15 09:00:00", user: "Fatima Ndiaye", userRole: "Responsable Stock", details: "Entrée stock: Riz Premium 5kg (+50) - Réception CMD-001", ip: "192.168.1.104", metadata: { product: "Riz Premium 5kg", quantity: 50, orderId: "CMD-001" } },
  { id: 8, type: "SUPPLIER_ORDER_RECEIVE", timestamp: "2024-12-15 09:00:00", user: "Fatima Ndiaye", userRole: "Responsable Stock", details: "Commande CMD-001 reçue de Africa Food Distribution", ip: "192.168.1.104", metadata: { orderId: "CMD-001", supplier: "Africa Food Distribution", amount: 2450000 } },

  // Hier
  { id: 9, type: "LOGIN", timestamp: "2024-12-14 18:30:00", user: "Karim Benali", userRole: "Super Admin", details: "Connexion réussie", ip: "192.168.1.100", metadata: { device: "Chrome on Windows" } },
  { id: 10, type: "LOGIN_FAILED", timestamp: "2024-12-14 16:45:00", user: "Inconnu", userRole: "-", details: "Tentative de connexion échouée avec email: test@inconnu.com", ip: "192.168.1.200", metadata: { email: "test@inconnu.com" } },
  { id: 11, type: "CLIENT_CREATE", timestamp: "2024-12-14 14:20:00", user: "Amina Toure", userRole: "Gérant", details: "Nouveau client créé: Ibrahim Keita", ip: "192.168.1.101", metadata: { clientId: 7, clientName: "Ibrahim Keita", type: "Détaillant" } },
  { id: 12, type: "RETURN_EXCHANGE", timestamp: "2024-12-14 11:00:00", user: "Amina Toure", userRole: "Gérant", details: "RET-2024-002 échangé: Chemise Homme → Chemise Homme taille L", ip: "192.168.1.101", metadata: { returnId: "RET-2024-002", oldProduct: "Chemise Homme", newProduct: "Chemise Homme taille L" } },
  { id: 13, type: "SALE_CREATE", timestamp: "2024-12-14 10:30:00", user: "Youssef Diallo", userRole: "Caissier", details: "Vente TRX-001: Riz Premium 5kg x10 → 45 000 FCFA", ip: "192.168.1.102", metadata: { saleId: "TRX-001", amount: 45000, client: "Amadou Koné" } },
  { id: 14, type: "SETTINGS_EXPORT", timestamp: "2024-12-14 09:15:00", user: "Karim Benali", userRole: "Super Admin", details: "Export des données produits", ip: "192.168.1.100", metadata: { exportType: "produits", format: "CSV", records: 18 } },

  // Avant-hier
  { id: 15, type: "STOCK_ALERT", timestamp: "2024-12-13 08:00:00", user: "Système", userRole: "Système", details: "Alerte: 3 produits en rupture de stock", ip: "-", metadata: { products: ["Café Torréfié 500g", "Chargeur Universel", "Thé Vert 250g"], criticalLevel: 0 } },
  { id: 16, type: "BACKUP_CREATE", timestamp: "2024-12-13 00:00:00", user: "Système", userRole: "Système", details: "Sauvegarde automatique effectuée", ip: "-", metadata: { backupSize: "45 MB", backupType: "auto" } },
  { id: 17, type: "INVOICE_CREATE", timestamp: "2024-12-13 15:30:00", user: "Omar Traoré", userRole: "Comptable", details: "Facture FAC-2024-003 créée pour Boubacar Touré", ip: "192.168.1.103", metadata: { invoiceId: "FAC-2024-003", amount: 125000, client: "Boubacar Touré" } },
  { id: 18, type: "PASSWORD_CHANGE", timestamp: "2024-12-13 11:20:00", user: "Amina Toure", userRole: "Gérant", details: "Mot de passe modifié", ip: "192.168.1.101", metadata: {} },
  { id: 19, type: "SUPPLIER_ORDER", timestamp: "2024-12-12 14:00:00", user: "Fatima Ndiaye", userRole: "Responsable Stock", details: "Commande CMD-002 passée à Tech Mali SARL", ip: "192.168.1.104", metadata: { orderId: "CMD-002", supplier: "Tech Mali SARL", amount: 3800000 } },
  { id: 20, type: "PRODUCT_CREATE", timestamp: "2024-12-12 10:00:00", user: "Fatima Ndiaye", userRole: "Responsable Stock", details: "Nouveau produit créé: Power Bank 10000mAh", ip: "192.168.1.104", metadata: { productId: 12, product: "Power Bank 10000mAh", price: 22000 } },

  // Plus anciens
  { id: 21, type: "RETURN_REFUND", timestamp: "2024-12-12 16:00:00", user: "Karim Benali", userRole: "Super Admin", details: "RET-2024-003 remboursé: 12 000 FCFA à Boubacar Touré", ip: "192.168.1.100", metadata: { returnId: "RET-2024-003", amount: 12000, method: "Mobile Money" } },
  { id: 22, type: "CLIENT_DELETE", timestamp: "2024-12-11 09:30:00", user: "Karim Benali", userRole: "Super Admin", details: "Client 'Test User' supprimé", ip: "192.168.1.100", metadata: { clientId: 99, clientName: "Test User" } },
  { id: 23, type: "SYSTEM_ERROR", timestamp: "2024-12-10 22:15:00", user: "Système", userRole: "Système", details: "Erreur de connexion à la base de données", ip: "-", metadata: { error: "Connection timeout", severity: "high" } },
  { id: 24, type: "SETTINGS_UPDATE", timestamp: "2024-12-10 14:00:00", user: "Karim Benali", userRole: "Super Admin", details: "Paramètres d'entreprise mis à jour", ip: "192.168.1.100", metadata: { section: "entreprise" } },
  { id: 25, type: "TWO_FA_ENABLED", timestamp: "2024-12-09 10:00:00", user: "Karim Benali", userRole: "Super Admin", details: "Authentification à deux facteurs activée", ip: "192.168.1.100", metadata: {} },
  { id: 26, type: "SALE_CANCEL", timestamp: "2024-12-08 16:45:00", user: "Youssef Diallo", userRole: "Caissier", details: "Vente TRX-005 annulée", ip: "192.168.1.102", metadata: { saleId: "TRX-005", amount: 36000, reason: "Erreur de commande" } },
];

export type StockProUser = (typeof MOCK_USERS)[number];
