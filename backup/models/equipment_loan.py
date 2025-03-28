"""
Modèles de données pour le module de prêt de matériel.
Ce module définit les modèles SQLAlchemy nécessaires pour la gestion des prêts de matériel.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class LoanStatus(enum.Enum):
    """Statuts possibles pour une demande de prêt."""
    PENDING = "En attente"
    APPROVED = "Approuvé"
    REJECTED = "Refusé"
    ACTIVE = "En cours"
    RETURNED = "Retourné"
    LATE = "En retard"
    CANCELLED = "Annulé"

class Material(Base):
    """
    Modèle représentant un matériel disponible pour le prêt.
    """
    __tablename__ = 'materials'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    quantity_total = Column(Integer, default=1, nullable=False)
    quantity_available = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    loan_requests = relationship("LoanRequest", back_populates="material")

    def __repr__(self):
        return f"<Material(id={self.id}, name='{self.name}', quantity_available={self.quantity_available})>"

class LoanRequest(Base):
    """
    Modèle représentant une demande de prêt de matériel.
    """
    __tablename__ = 'loan_requests'

    id = Column(Integer, primary_key=True)
    user_id = Column(String(100), nullable=False)  # ID de l'utilisateur Azure AD
    user_email = Column(String(100), nullable=False)
    user_name = Column(String(100), nullable=False)
    material_id = Column(Integer, ForeignKey('materials.id'), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    comment = Column(Text, nullable=True)
    status = Column(Enum(LoanStatus), default=LoanStatus.PENDING, nullable=False)
    admin_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    material = relationship("Material", back_populates="loan_requests")
    loan = relationship("Loan", uselist=False, back_populates="loan_request")

    def __repr__(self):
        return f"<LoanRequest(id={self.id}, user='{self.user_name}', material_id={self.material_id}, status={self.status})>"

class Loan(Base):
    """
    Modèle représentant un prêt actif de matériel.
    """
    __tablename__ = 'loans'

    id = Column(Integer, primary_key=True)
    loan_request_id = Column(Integer, ForeignKey('loan_requests.id'), nullable=False)
    checkout_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    expected_return_date = Column(DateTime, nullable=False)
    actual_return_date = Column(DateTime, nullable=True)
    is_returned = Column(Boolean, default=False)
    return_condition = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    loan_request = relationship("LoanRequest", back_populates="loan")

    def __repr__(self):
        return f"<Loan(id={self.id}, loan_request_id={self.loan_request_id}, is_returned={self.is_returned})>"

class Notification(Base):
    """
    Modèle représentant une notification liée à un prêt de matériel.
    """
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True)
    user_id = Column(String(100), nullable=False)  # ID de l'utilisateur Azure AD
    user_email = Column(String(100), nullable=False)
    loan_request_id = Column(Integer, ForeignKey('loan_requests.id'), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id='{self.user_id}', is_read={self.is_read})>"
