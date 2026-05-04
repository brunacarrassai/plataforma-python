const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        //target body -> valida req.body (POST/PUT)
        //target query -> valida req.query (PARA GET COM FILTROS)
        const data = target === 'query' ? req.query : req.body;
        
        const { error, value } = schema.validate(data, {
            abortEarly: false, // retorna TODOS os erros, não só o primeiro
            stripUnknow: true, // remove campos fora do schema
            convert: true, // converte tipos "1" -> 1 para numbers 
        });

        if (error) {
            const errors = error.details.map((d) => d.message);
            return res.status(400).json({
                error: 'Dados inválidos',
                datails: errors,
            });
        }

        // substitui req.body/query pelos dados já validados e limpos
        if (target === 'query') {
            req.query = value;
        } else {
            req.body = value;
        }

        next();
    };
};

module.exports = { validate };