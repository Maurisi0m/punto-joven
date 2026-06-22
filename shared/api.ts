/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// =====================================================
// NEGOCIOS (BUSINESS)
// =====================================================

export interface BusinessAccount {
  business_id: number;
  email: string;
  business_name: string;
  razon_social?: string;
  owner_name: string;
  cargo?: string;
  phone: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  redes_sociales?: string | null;
  tipoDescuento?: string | null;
  restricciones?: string | null;
  logo_url: string | null;
  local_photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  status_comment: string | null;
  created_at: string;
  approved_at: string | null;
  updated_at: string;
}

export interface AdminBusinessListResponse {
  items: BusinessAccount[];
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface UpdateBusinessStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

// =====================================================
// JÓVENES BENEFICIARIOS
// =====================================================

export interface YoungBeneficiary {
  beneficiary_id: number;
  token?: string;
  email: string;
  password_hash: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  edad: number | null;
  estudio: string | null;
  genero: string | null;
  phone: string | null;
  calle: string | null;
  colonia_depa: string | null;
  ciudad: string | null;
  municipio: string | null;
  estado: string | null;
  foto_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  status_comment: string | null;
  created_at: string;
  approved_at: string | null;
  updated_at: string;
}

export interface AdminBeneficiariesListResponse {
  items: YoungBeneficiary[];
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface UpdateBeneficiaryStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

// =====================================================
// JÓVENES MAYORES DE EDAD (18-29 años)
// =====================================================

export interface YoungAdult {
  beneficiary_id: number;
  email: string;
  password_hash: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  edad: number | null;
  grado_estudio: string | null;
  ocupacion: string | null;
  phone: string | null;
  calle: string | null;
  municipio: string | null;
  estado: string | null;
  pais: string | null;
  ine_url: string | null;
  comprobante_domicilio_url: string | null;
  foto_credencial_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  status_comment: string | null;
  created_at: string;
  approved_at: string | null;
  updated_at: string;
}

// =====================================================
// JÓVENES MENORES DE EDAD (12-17 años)
// =====================================================

export interface YoungMinor {
  minor_id: number;
  email: string;
  password_hash: string;

  // Datos padre/tutor
  tutor_nombre: string;
  tutor_apellido_paterno: string;
  tutor_apellido_materno: string;
  tutor_fecha_nacimiento: string;
  tutor_curp: string;
  tutor_parentesco: string;
  tutor_ine_url: string | null;
  tutor_domicilio: string;

  // Datos menor
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  edad: number | null;
  credencial_escolar_url: string | null;
  phone: string | null;
  calle: string | null;
  municipio: string | null;
  estado: string | null;
  pais: string | null;
  foto_credencial_url: string | null;

  status: 'pending' | 'approved' | 'rejected';
  status_comment: string | null;
  created_at: string;
  approved_at: string | null;
  updated_at: string;
}

export interface AdminYoungListResponse {
  adults: YoungAdult[];
  minors: YoungMinor[];
}

// =====================================================
// ADMIN DASHBOARD
// =====================================================

export interface AdminDashboardStats {
  businesses: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  beneficiaries: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  youngMinors: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  youngAdults: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recentBusinesses: BusinessAccount[];
  recentBeneficiaries: YoungBeneficiary[];
}

// =====================================================
// COMERCIOS AFILIADOS (PUBLICOS)
// =====================================================

export interface ApprovedBusiness {
  business_id: number;
  business_name: string;
  category: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  local_photo_url: string | null;
  website: string | null;
  tipoDescuento?: string | null;
  restricciones?: string | null;
  approved_at?: string | null;
}

export interface ApprovedBusinessesResponse {
  items: ApprovedBusiness[];
}
