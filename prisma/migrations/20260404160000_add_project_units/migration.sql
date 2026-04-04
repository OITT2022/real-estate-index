-- CreateTable
CREATE TABLE "ProjectUnit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "building" TEXT NOT NULL DEFAULT '1',
    "entrance" TEXT NOT NULL DEFAULT 'A',
    "floor" INTEGER NOT NULL DEFAULT 0,
    "unitNumber" TEXT NOT NULL,
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUnit_propertyId_key" ON "ProjectUnit"("propertyId");

-- CreateIndex
CREATE INDEX "ProjectUnit_projectId_building_entrance_floor_idx" ON "ProjectUnit"("projectId", "building", "entrance", "floor");

-- CreateIndex
CREATE INDEX "ProjectUnit_propertyId_idx" ON "ProjectUnit"("propertyId");

-- AddForeignKey
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
