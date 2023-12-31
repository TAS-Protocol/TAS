import axios from "axios";
import { tables } from "@/lib/utils";

const TablelandGateway =
  "https://testnets.tableland.network/api/v1/query?statement=";

export const getAllSchemas = async (chainId) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
        ${tables[chainId].schema}.name,
        ${tables[chainId].schema}.description,
        ${tables[chainId].schema}.creator,
        ${tables[chainId].schema}.resolver,
        ${tables[chainId].schema}.schema,
        ${tables[chainId].schema}.schemaUID,
        ${tables[chainId].schema}.creationTimestamp,
        COUNT(${tables[chainId].attestation}.uid) AS total,
        json_group_array(
            json_object('category', ${tables[chainId].categories}.category)
        ) AS categories
    FROM
        ${tables[chainId].schema}
    LEFT JOIN
        ${tables[chainId].attestation}
    ON
        ${tables[chainId].schema}.schemaUID = ${tables[chainId].attestation}.schemaUID
    LEFT JOIN
        ${tables[chainId].categories}
    ON
        ${tables[chainId].schema}.schemaUID = ${tables[chainId].categories}.schemaUID
    GROUP BY
        ${tables[chainId].schema}.schemaUID
    ORDER BY
        ${tables[chainId].schema}.creationTimestamp DESC`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAllUserCreatedSchemas = async (chainId, address) => {
  if (!address) {
    return null;
  }
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
        ${tables[chainId].schema}.name,
        ${tables[chainId].schema}.description,
        ${tables[chainId].schema}.creator,
        ${tables[chainId].schema}.resolver,
        ${tables[chainId].schema}.schema,
        ${tables[chainId].schema}.schemaUID,
        ${tables[chainId].schema}.creationTimestamp,
        COUNT(${tables[chainId].attestation}.uid) AS total,
        json_group_array(
          json_object('category', ${tables[chainId].categories}.category)
        ) AS categories,        
        SUM(CASE WHEN ${
          tables[chainId].attesters
        }.attester = '${address?.toLowerCase()}' THEN 1 ELSE 0 END) AS attester_count,
        SUM(CASE WHEN ${
          tables[chainId].revokers
        }.revoker = '${address?.toLowerCase()}' THEN 1 ELSE 0 END) AS revoker_count,
        MAX(CASE WHEN ${
          tables[chainId].info
        }.admin = '${address?.toLowerCase()}' THEN 1 ELSE 0 END) AS admin_count
    FROM
        ${tables[chainId].schema}
    LEFT JOIN
        ${tables[chainId].attestation}
    ON
        ${tables[chainId].schema}.schemaUID = ${
      tables[chainId].attestation
    }.schemaUID
    LEFT JOIN
        ${tables[chainId].categories}
    ON
        ${tables[chainId].schema}.schemaUID = ${
      tables[chainId].categories
    }.schemaUID
    LEFT JOIN
        ${tables[chainId].revokers}
    ON
        ${tables[chainId].schema}.schemaUID = ${
      tables[chainId].revokers
    }.schemaUID
    LEFT JOIN
        ${tables[chainId].attesters}
    ON
        ${tables[chainId].schema}.schemaUID = ${
      tables[chainId].attesters
    }.schemaUID
    LEFT JOIN
        ${tables[chainId].info}
    ON
        ${tables[chainId].schema}.schemaUID = ${tables[chainId].info}.schemaUID
    WHERE
        ${tables[chainId].schema}.creator='${address?.toLowerCase()}' OR
        ${tables[chainId].revokers}.revoker='${address?.toLowerCase()}' OR
        ${tables[chainId].attesters}.attester='${address?.toLowerCase()}'
    GROUP BY
        ${tables[chainId].schema}.schemaUID,
        ${tables[chainId].schema}.name,
        ${tables[chainId].schema}.description,
        ${tables[chainId].schema}.resolver,
        ${tables[chainId].schema}.schema,
        ${tables[chainId].schema}.creationTimestamp
    ORDER BY
        ${tables[chainId].schema}.creationTimestamp DESC`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getCreatedSchemasRevenue = async (chainId, user) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
          ${tables[chainId].group_revenue}.totalClaimed,
          ${tables[chainId].content_admins}.shares,
          ${tables[chainId].group_revenue}.schemaUID

      FROM
          ${tables[chainId].group_revenue}
      JOIN
          ${tables[chainId].content_admins}
      ON
          ${tables[chainId].group_revenue}.schemaUID = ${
      tables[chainId].content_admins
    }.schemaUID
      WHERE ${tables[chainId].content_admins}.attester = '${user.toLowerCase()}'
      GROUP BY
          ${tables[chainId].content_admins}.shares`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getUserSubscriptions = async (chainId, address) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
         *
      FROM
          ${tables[chainId].content_subscription}
      WHERE
          ${
            tables[chainId].content_subscription
          }.subscriber = '${address.toLowerCase()}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSchemaInfo = async (chainId, schemaUID) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
          ${tables[chainId].schema}.resolver,
          ${tables[chainId].schema}.schema
      FROM
          ${tables[chainId].schema}
      WHERE
          ${tables[chainId].schema}.schemaUID = '${schemaUID}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSubscriptionSchemaCreators = async (chainId, schemaUID) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT attester
    FROM ${tables[chainId].content_admins}
    WHERE schemaUID = '${schemaUID}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getACSchemaAttesters = async (chainId, schemaUID) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT 'revoker' AS type, ${tables[chainId].revokers}.revoker AS address, ${tables[chainId].revokers}.schemaUID
    FROM ${tables[chainId].revokers}
    WHERE ${tables[chainId].revokers}.schemaUID = '${schemaUID}'
    
    UNION ALL
    
    SELECT 'attester' AS type, ${tables[chainId].attesters}.attester AS address, ${tables[chainId].attesters}.schemaUID
    FROM ${tables[chainId].attesters}
    WHERE ${tables[chainId].attesters}.schemaUID = '${schemaUID}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getIsEncrypted = async (chainId, schemaUID) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
        ${tables[chainId].info}.encrypted
    FROM
        ${tables[chainId].info}
    WHERE
        ${tables[chainId].info}.schemaUID = '${schemaUID}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    if (result.data.length == 0) {
      return false;
    } else {
      return result.data[0].encrypted == "true" ? true : false;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAttestations = async (chainId) => {
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT 
        ${tables[chainId].attestation}.uid , 
        ${tables[chainId].attestation}.attester , 
        ${tables[chainId].attestation}.schemaUID , 
        ${tables[chainId].attestation}.creationTimestamp , 
        ${tables[chainId].attestation}.data , 
        ${tables[chainId].attestation}.recipient , 
        ${tables[chainId].attestation}.expirationTime , 
        ${tables[chainId].attestation}.refUID
    FROM 
        ${tables[chainId].attestation}
    ORDER BY 
        ${tables[chainId].attestation}.creationTimestamp DESC`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getUserAttestations = async (chainId, address) => {
  if (!address) {
    return null;
  }
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT 
        ${tables[chainId].attestation}.uid , 
        ${tables[chainId].attestation}.attester , 
        ${tables[chainId].attestation}.schemaUID , 
        ${tables[chainId].attestation}.creationTimestamp , 
        ${tables[chainId].attestation}.data , 
        ${tables[chainId].attestation}.recipient , 
        ${tables[chainId].attestation}.expirationTime , 
        ${tables[chainId].attestation}.refUID
    FROM
        ${tables[chainId].attestation}
    WHERE 
        ${tables[chainId].attestation}.attester='${address?.toLowerCase()}'
    ORDER BY 
        ${tables[chainId].attestation}.creationTimestamp DESC`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getReferencedAttestations = async (chainId, attestationUID) => {
  if (!attestationUID) {
    return null;
  }
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT 
        ${tables[chainId].attestation}.uid
    FROM
        ${tables[chainId].attestation}
    WHERE 
    ${tables[chainId].attestation}.refUID='${attestationUID?.toLowerCase()}'
    ORDER BY 
        ${tables[chainId].attestation}.creationTimestamp DESC`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getUserRecievedAttestations = async (chainId, address) => {
  if (!address) {
    return null;
  }
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT 
        ${tables[chainId].attestation}.uid , 
        ${tables[chainId].attestation}.attester , 
        ${tables[chainId].attestation}.schemaUID , 
        ${tables[chainId].attestation}.creationTimestamp , 
        ${tables[chainId].attestation}.data , 
        ${tables[chainId].attestation}.recipient , 
        ${tables[chainId].attestation}.expirationTime , 
        ${tables[chainId].attestation}.refUID
    FROM 
        ${tables[chainId].attestation}
    WHERE 
        ${tables[chainId].attestation}.recipient='${address?.toLowerCase()}'
    ORDER BY 
        ${tables[chainId].attestation}.creationTimestamp DESC`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSchema = async (chainId, schemaUID) => {
  const getSchemaQuery =
    TablelandGateway +
    `SELECT 
          s.name,
          s.description,
          s.schema,
          s.resolver,
          s.creationTimestamp,
          s.creator,
          json_group_array(json_object('category', c.category)) as categories
      FROM 
          ${tables[chainId].schema} s
      LEFT JOIN 
          ${tables[chainId].categories} c ON s.schemaUID = c.schemaUID
      WHERE 
          s.schemaUID = '${schemaUID}'`;
  try {
    const result = await axios.get(getSchemaQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSchemaAttestations = async (chainId, schemaUID) => {
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT 
        ${tables[chainId].attestation}.uid , 
        ${tables[chainId].attestation}.attester , 
        ${tables[chainId].attestation}.creationTimestamp , 
        ${tables[chainId].attestation}.data , 
        ${tables[chainId].attestation}.recipient , 
        ${tables[chainId].attestation}.expirationTime , 
        ${tables[chainId].attestation}.refUID  
    FROM 
        ${tables[chainId].attestation} 
    WHERE 
        ${tables[chainId].attestation}.schemaUID=%27${schemaUID}%27
    ORDER BY 
        ${tables[chainId].attestation}.creationTimestamp DESC`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAttestation = async (chainId, uid) => {
  const getAttestationDataQuery =
    TablelandGateway +
    `SELECT 
        ${tables[chainId].schema}.resolver , 
        ${tables[chainId].revocation}.revocable , 
        ${tables[chainId].schema}.schema , 
        ${tables[chainId].schema}.schemaUID ,
        ${tables[chainId].attestation}.attester , 
        ${tables[chainId].attestation}.creationTimestamp , 
        ${tables[chainId].attestation}.data , 
        ${tables[chainId].attestation}.recipient , 
        ${tables[chainId].attestation}.expirationTime , 
        ${tables[chainId].attestation}.refUID ,
        ${tables[chainId].revocation}.revocationTime , 
        ${tables[chainId].revocation}.revoker   
    FROM 
        ${tables[chainId].attestation} , 
        ${tables[chainId].schema} , 
        ${tables[chainId].revocation}
    WHERE 
        ${tables[chainId].attestation}.uid=%27${uid}%27 AND 
        ${tables[chainId].attestation}.uid = ${tables[chainId].revocation}.uid AND
        ${tables[chainId].attestation}.schemaUID = ${tables[chainId].schema}.schemaUID`;
  try {
    const result = await axios.get(getAttestationDataQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAttestAccess = async (chainId, schemaUID, address) => {
  if (address) {
    const getSchemaQuery =
      TablelandGateway +
      `SELECT 
            COUNT(${tables[chainId].content_admins}.attester) AS NUM 
        FROM 
            ${tables[chainId].content_admins} 
        WHERE
            ${tables[chainId].content_admins}.schemaUID='${schemaUID}' AND
            ${
              tables[chainId].content_admins
            }.attester='${address.toLowerCase()}'`;
    try {
      const result = await axios.get(getSchemaQuery);
      return result.data[0].NUM > 0;
    } catch (err) {
      console.error(err);
      return null;
    }
  } else {
    return null;
  }
};

export const getAttestRevokeAccess = async (chainId, address, schemaUID) => {
  if (address) {
    const getSchemaQuery =
      TablelandGateway +
      `SELECT 
          COUNT(attesters.attester) AS at, 
          COUNT(revokers.revoker) AS rev, 
          COUNT(info.admin) AS admin 
      FROM 
          ${tables[chainId].attesters} AS attesters
      LEFT JOIN 
          ${tables[chainId].revokers} AS revokers
      ON 
          attesters.schemaUID = revokers.schemaUID
          AND revokers.revoker = '${address.toLowerCase()}'
      LEFT JOIN 
          ${tables[chainId].info} AS info
      ON 
          attesters.schemaUID = info.schemaUID
          AND info.admin = '${address.toLowerCase()}'
      WHERE
          attesters.attester = '${address.toLowerCase()}'
          AND attesters.schemaUID = '${schemaUID.toLowerCase()}'`;
    try {
      const result = await axios.get(getSchemaQuery);
      return {
        revokeAccess: result.data[0].rev > 0,
        attestAccess: result.data[0].at > 0,
        isAdmin: result.data[0].admin > 0,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  } else {
    return null;
  }
};

export const getSubscriptionPrice = async (chainId, schemaUID) => {
  const getSchemaQuery =
    TablelandGateway +
    `SELECT 
        ${tables[chainId].content_group}.monthlySubscriptionPrice AS Price 
      FROM 
          ${tables[chainId].content_group} 
      WHERE
          ${tables[chainId].content_group}.schemaUID='${schemaUID}'`;
  try {
    const result = await axios.get(getSchemaQuery);
    return result.data[0].Price;
  } catch (err) {
    console.error(err);
    return null;
  }
};
