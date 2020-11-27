CREATE OR REPLACE PROCEDURE insert_data(name_ character varying, sizeoffile_mb numeric, s3uniquename character varying, cloud_ character varying, uploadedby character varying, ownedby character varying, tagskeys text[], tagsvalues text[], clusterid integer )
    LANGUAGE plpgsql
as
$$
    DECLARE
        v_new_id integer;
    BEGIN
        -- Check
        IF sizeoffile_mb IS NULL THEN
            RAISE EXCEPTION 'file size cannot be null';
        END IF;

        INSERT INTO filesmetadataview (name, "sizeOfFile_MB", "S3uniqueName", cloud, "uploadedBy", "ownedBy", "tagsKeys", "tagsValues") VALUES (name_, sizeoffile_mb, s3uniquename, cloud_, uploadedby, ownedby, tagskeys, tagsvalues) RETURNING id INTO v_new_id;
        INSERT INTO "file-clusterSubDBs" ("fileId","clusterId","createdAt","updatedAt") VALUES (v_new_id,clusterid,now(),now());
    END
$$;

