CREATE TABLE filesMetadataLogs (
    operation         char(1)   NOT NULL,
    userid            text      NOT NULL,
    fileId          integer      NOT NULL,
    stamp             timestamp NOT NULL
);

CREATE VIEW filesMetadataView AS
    SELECT "filesMetadataDBs".id,
           "filesMetadataDBs".name,
           "filesMetadataDBs"."sizeOfFile_MB",
           "filesMetadataDBs"."S3uniqueName",
           "filesMetadataDBs".cloud,
           "filesMetadataDBs"."uploadedBy",
           "filesMetadataDBs"."ownedBy",
           "filesMetadataDBs"."tagsKeys",
           "filesMetadataDBs"."tagsValues",
           "filesMetadataDBs"."createdAt",
           "filesMetadataDBs"."updatedAt",
           max(filesMetadataLogs.stamp) AS last_updated
      FROM "filesMetadataDBs"
      LEFT JOIN filesMetadataLogs ON filesMetadataLogs.fileId = "filesMetadataDBs".id
    GROUP BY "filesMetadataDBs".id, "filesMetadataDBs"."sizeOfFile_MB";

CREATE OR REPLACE FUNCTION update_files_metadata_view() RETURNS TRIGGER AS $$
    DECLARE
        v_new_id integer;
    BEGIN
        --
        -- Выполнить требуемую операцию в someInfo и добавить в someInfoLogs строку,
        -- отражающую эту операцию.
        --
        IF (TG_OP = 'DELETE') THEN
            DELETE FROM "filesMetadataDBs" WHERE id = OLD.id;
            IF NOT FOUND THEN RETURN NULL; END IF;

            OLD.last_updated = now();
            INSERT INTO filesMetadataLogs VALUES('D', user, OLD.id, OLD.last_updated);
            RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
            UPDATE "filesMetadataDBs" SET name = NEW.name, "S3uniqueName" = NEW."S3uniqueName", cloud = NEW.cloud, "uploadedBy" = NEW."uploadedBy", "ownedBy" = NEW."ownedBy", "sizeOfFile_MB" = NEW."sizeOfFile_MB", "tagsKeys" = NEW."tagsKeys", "tagsValues" = NEW."tagsValues", "updatedAt" = now() WHERE id = OLD.id;
            IF NOT FOUND THEN RETURN NULL; END IF;

            NEW.last_updated = now();
            INSERT INTO filesMetadataLogs VALUES('U', user, NEW.id, NEW.last_updated);
            RETURN NEW;
        ELSIF (TG_OP = 'INSERT') THEN
            INSERT INTO "filesMetadataDBs" (name, "S3uniqueName", cloud, "uploadedBy", "ownedBy", "sizeOfFile_MB", "tagsKeys", "tagsValues", "createdAt", "updatedAt") VALUES(New.name, New."S3uniqueName", New."cloud", New."uploadedBy", New."ownedBy", New."sizeOfFile_MB", New."tagsKeys", New."tagsValues", now(), now()) RETURNING id INTO v_new_id;
            NEW.id = v_new_id;
            NEW.last_updated = now();
            INSERT INTO filesMetadataLogs (operation, userid, fileId, stamp) VALUES('I', user, NEW.id, NEW.last_updated);
            RETURN NEW;
        END IF;
    END
$$ LANGUAGE plpgsql;


CREATE TRIGGER filesMetadataLogs
INSTEAD OF INSERT OR UPDATE OR DELETE ON filesMetadataView
    FOR EACH ROW EXECUTE PROCEDURE update_files_metadata_view();
