// api.js

export async function envoyerRequeteApi(pRequete, additionalParam) {
    let sqlQuery = construireRequeteSql(pRequete, additionalParam);
    let xml;

    try {
        xml = construireXml(sqlQuery); 
    } catch (error) {
        console.error("Error constructing SQL query:", error);
        return null; // Renvoie null en cas d'erreur
    }

    try {
        const response = await fetch('http://154.12.224.173/api/execute_requete_from_xml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: xml
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();        
        // Vérifier si data est un tableau non vide
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        // Vérifier si data est un objet non vide
        else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la requête API:', error);
        return null;
    }
}

function construireRequeteSql(pSQL_Request, additionalParam) {
    let sqlQuery = pSQL_Request;
    if (additionalParam !== "") {
        sqlQuery += additionalParam;
    }
    return sqlQuery;
}

function construireXml(requeteSql) {
    let sql_text = requeteSql.replace(/\n/g, '');
    return `<?xml version="1.0" encoding="UTF-8"?>
        <requete>
            <application>senmarche</application>
            <requete_sql>${sql_text}</requete_sql>
            <mode>SELECT</mode>
            <json_contenu>{ "code":"400"}</json_contenu>
            <table_name></table_name>
            <id_name></id_name>
            <condition>aucune</condition>
        </requete>`;
}
