export class Category {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class Tag {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class PetDto {
    id: number;
    category: Category;
    name: string;
    photoUrls: string[];
    tags: Tag[];
    status: string;

    constructor(
        id: number,
        category: Category,
        name: string,
        photoUrls: string[],
        tags: Tag[],
        status: string
    ) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.photoUrls = photoUrls;
        this.tags = tags;
        this.status = status;
    }
}
