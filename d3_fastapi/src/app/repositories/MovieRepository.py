from sqlalchemy.orm import Session

from models.Movies import Movies


class MovieRepository:
    @staticmethod
    def find_all(db: Session) -> list:
        return db.query(Movies).all()

    @staticmethod
    def save(db: Session, movie: Movies) -> Movies:
        if movie.id:
            db.merge(movie)
        else:
            db.add(movie)
        db.commit()
        return movie

    @staticmethod
    def find_by_id(db: Session, id: int) -> Movies:
        return db.query(Movies).filter(Movies.id == id).first()  # type: ignore

    @staticmethod
    def exists_by_id(db: Session, id: int) -> bool:
        return db.query(Movies).filter(Movies.id == id).first() is not None  # type: ignore

    @staticmethod
    def delete_by_id(db: Session, id: int) -> None:
        movie = db.query(Movies).filter(Movies.id == id).first()  # type: ignore
        if movie is not None:
            db.delete(movie)
            db.commit()
