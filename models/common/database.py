"""
Module de base de données partagé pour l'application TeamsRooms.
Ce module définit l'instance SQLAlchemy qui sera partagée entre l'application principale et les modules.
"""

from flask_sqlalchemy import SQLAlchemy

# Création d'une instance SQLAlchemy partagée
db = SQLAlchemy()
