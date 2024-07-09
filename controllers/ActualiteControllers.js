const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    getAllActualites: async (req, res) => {
        try {
            const actualites = await prisma.actualite.findMany();
            console.log('Actualités renvoyées:', actualites); // Log du contenu renvoyé
            res.status(200).json(actualites);
        } catch (error) {
            console.error('Erreur lors de la récupération des actualités:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des actualités', error });
        }
    },

    getActualiteById: async (req, res) => {
        try {
            const { id } = req.params;
            const actualite = await prisma.actualite.findUnique({
                where: { id: parseInt(id) }
            });
            if (actualite) {
                // console.log('Actualité renvoyée:', actualite); 
                res.status(200).json(actualite);
            } else {
                res.status(404).json({ message: "Actualité non trouvée" });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'actualité:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'actualité', error });
        }
    }
};
